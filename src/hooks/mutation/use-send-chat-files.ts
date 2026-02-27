import { useMutation } from "@tanstack/react-query";

import {
	droppedFiles,
	type PromiseToWaitForFileToBeUploaded,
} from "#/contexts/dropped-files";
import {
	generalCtx,
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { getNotebook } from "#/lib/query-client-helpers";
import {
	createISODate,
	createNotebookBlockUuid,
	getRandomSnakeCaseName,
	isDev,
	isValidNumber,
} from "#/lib/utils";
import type { ISODateString } from "#/types/general";
import {
	type BlockBase,
	type BlockCsv,
	type BlockImage,
	BlockLabel,
	BlockObjectType,
	type BlockPDF,
	BlockType,
	type CreateBlockAction,
	NotebookActionType,
} from "#/types/notebook";
import { useGetUser } from "#/hooks/get/use-get-user";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { usePatchNotebookBlocks } from "#/hooks/mutation/use-patch-notebook-blocks";

type SendChatFilesRequest = {
	files: Array<File>;
};

const mutationKey = queryKeyFactory.post["send-chat-files"].queryKey;

export function useSendChatFiles() {
	const patchNotebookBlocks = usePatchNotebookBlocks();
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const betterbrainUser = useGetUser();

	return useMutation<null, Error, SendChatFilesRequest>({
		mutationKey,

		async mutationFn(args) {
			if (args.files.length === 0) return null;

			/*
			We need to create blocks in the normal project.
			The response from the websockets will create the blocks.
			The new blocks will go through the process of initialization
			and encounter a file in the `droppedFiles`, which will fire
			the needed steps to upload the file and run it.
			*/
			const notebookId = generalCtx.getState().notebookId;

			if (!isValidNumber(notebookId)) {
				throw new Error("NotebookId is not valid!");
			}

			const notebook = getNotebook(notebookId);

			if (!notebook) {
				throw new Error("Notebook not found!");
			}

			const promisesToWaitForFilesToBeUploaded: Array<PromiseToWaitForFileToBeUploaded> =
				[];

			const createBlockActions = (() => {
				let blockIndex = notebook.blocks.length;

				const uuidForNewBlocks = args.files.map(() => ({
					uuid: createNotebookBlockUuid(),
				}));
				const blocks = notebook.blocks
					.map(({ uuid }) => ({ uuid }))
					.concat(...uuidForNewBlocks);

				blockIndex = notebook.blocks.length;

				const newBlocks = args.files.map((file, fileIndex) => {
					const now = new Date();
					const nowISO = now.toISOString() as ISODateString;
					const isImageBlock = file.type.startsWith("image/");
					const isCSVBlock = file.type === "text/csv";
					const blockAbove = blocks[blockIndex - 1];
					const blockBelow = blocks[blockIndex + 1];

					const baseBlock: BlockBase = {
						label: isImageBlock
							? BlockLabel.IMAGE
							: isCSVBlock
								? BlockLabel.CSV
								: BlockLabel.PDF,
						write_variables: [{ name: getRandomSnakeCaseName() }],
						// @ts-expect-error => this is just so it is accessible later in this code:
						block_below_uuid: blockBelow?.uuid ?? null,
						block_above_uuid: blockAbove?.uuid ?? null,
						uuid: uuidForNewBlocks[fileIndex]!.uuid,
						order_by_timestamp_ms: now.getTime(),
						last_modified_by: betterbrainUser,
						object: BlockObjectType.Block,
						last_run_by: betterbrainUser,
						created_by: betterbrainUser,
						last_modified_at: nowISO,
						parent_block_uuid: null,
						last_run_at: nowISO,
						similar_queries: [],
						created_at: nowISO,
						read_variables: [],
						is_running: false,
						id: undefined,
					};

					const block = (() => {
						if (isCSVBlock) {
							const csvBlock: BlockCsv = {
								...baseBlock,
								type: BlockType.Csv,

								custom_block_info: {
									data_preview_updated_at: null,
									is_data_preview_stale: false,
									file_size_bytes: file.size,
									file_name: file.name,
									data_preview: null,
									filters: null,
									file_info: "",
									title: "",
								},
							};

							return csvBlock;
						} else if (isImageBlock) {
							const imageBlock: BlockImage = {
								...baseBlock,
								type: BlockType.Image,

								custom_block_info: {
									preview_url: null,
									aws_bucket: null,
									aws_key: null,
									caption: null,
									title: "",
								},
							};

							return imageBlock;
						} else {
							const pdfBlock: BlockPDF = {
								...baseBlock,
								type: BlockType.Pdf,

								custom_block_info: {
									title: "",
									pdf: {
										file_size_bytes: `${file.size}`,
										file_name: file.name,
										file_info: file.type,
										type: "pdf",
									},
								},
							};

							return pdfBlock;
						}
					})();

					if (!block) return null;

					{
						// We need to make sure `droppedFiles` has the files for the new
						// blocks, so they can upload the files to the backend:

						const promiseToWaitForFileToBeUploaded =
							{} as PromiseToWaitForFileToBeUploaded;

						const promise = new Promise<void>((resolve, reject) => {
							promiseToWaitForFileToBeUploaded.resolve = resolve;
							promiseToWaitForFileToBeUploaded.reject = reject;
						});
						promiseToWaitForFileToBeUploaded.promise = promise;
						promisesToWaitForFilesToBeUploaded.push(
							promiseToWaitForFileToBeUploaded,
						);

						droppedFiles.set(block.uuid, {
							promiseToWaitForFileToBeUploaded,
							file,
						});
					}

					++blockIndex;

					return block;
				});

				console.log({
					droppedFiles: isDev ? droppedFiles : droppedFiles.size,
					promisesToWaitForFilesToBeUploaded,
				});

				const createActions: Array<CreateBlockAction> = newBlocks
					.map((newBlock) =>
						newBlock
							? ({
									action_type: NotebookActionType.CreateBlock,
									action_info: {
										block_above_uuid: newBlock.block_above_uuid,
										// @ts-expect-error => this is where we are accessing `block_below_uuid`
										block_below_uuid: newBlock.block_below_uuid,
										parent_block_uuid: null,
										block: newBlock,
									},
									timestamp: createISODate(),
								} satisfies CreateBlockAction)
							: false,
					)
					.filter(Boolean) as Array<CreateBlockAction>;

				return createActions;
			})();

			await patchNotebookBlocks.mutateAsync({
				notebookId: notebook.metadata.id,
				updates: createBlockActions,
				timestamp: createISODate(),
				botConversationId,
				organizationId,
			});

			await Promise.allSettled(
				promisesToWaitForFilesToBeUploaded.map((p) => p.promise),
			);

			return null;
		},

		meta: {
			errorTitle: "Error sending chat files!",
		},
	});
}
