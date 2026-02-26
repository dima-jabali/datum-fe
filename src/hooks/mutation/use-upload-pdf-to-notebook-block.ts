import { useIsMutating, useMutation } from "@tanstack/react-query";
import axios from "axios";

import { clientAPI_V1 } from "#/api/axios";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { setNotebook } from "#/lib/query-client-helpers";
import { createISODate, isValidNumber, prettyBytes } from "#/lib/utils";
import type { ISODateString } from "#/types/general";
import type { BlockPDF, NotebookBlockUuid } from "#/types/notebook";
import {
	PostBlockActionType,
	type PostBlockResponse,
	type UpdateBlockResponseAction,
} from "#/types/post-block-update";

type PdfGeneratePresignedUploadUrlActionInfo = {
	file_name: string;
};

type PdfGeneratePresignedUploadUrlAction = {
	action_type: PostBlockActionType.PdfGeneratePresignedUploadUrl;
	action_info: PdfGeneratePresignedUploadUrlActionInfo;
	timestamp: ISODateString;
};

type PdfGeneratePresignedUploadURLResponse = PostBlockResponse<{
	upload_url: string;
}>;

type UploadPdfRequest = {
	bytesParagraphRef: React.RefObject<HTMLParagraphElement | null>;
	progressRef: React.RefObject<HTMLProgressElement | null>;
	blockUuid: NotebookBlockUuid;
	file: File;
};

type UploadPdfResponse = null;

export function useUploadPdfToNotebookBlock(blockUuid: NotebookBlockUuid) {
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();

	return useMutation<UploadPdfResponse, Error, UploadPdfRequest>({
		mutationKey:
			queryKeyFactory.post["block-request"]._ctx["upload-pdf"](blockUuid)
				.queryKey,

		meta: {
			errorTitle: "Error uploading PDF file!",
		},

		async mutationFn(args, ctx) {
			const generateUploadUrlAction: PdfGeneratePresignedUploadUrlAction = {
				action_type: PostBlockActionType.PdfGeneratePresignedUploadUrl,
				action_info: { file_name: args.file.name },
				timestamp: createISODate(),
			};

			const generateUploadUrlResponse =
				await clientAPI_V1.post<PdfGeneratePresignedUploadURLResponse>(
					`/blocks/${args.blockUuid}/action`,
					generateUploadUrlAction,
				);

			if (generateUploadUrlResponse.data?.action_output?.error) {
				throw new Error(generateUploadUrlResponse.data.action_output.error);
			}

			const uploadUrl = generateUploadUrlResponse.data.action_output.upload_url;

			if (!uploadUrl) {
				throw new Error("No upload url!");
			}

			await axios.put(uploadUrl, args.file, {
				headers: {
					"Content-Type": "application/pdf",
				},
				onUploadProgress(progressEvent) {
					if (
						!(
							args.bytesParagraphRef.current &&
							args.progressRef.current &&
							progressEvent.progress
						)
					)
						return;

					const percent = Math.round(progressEvent.progress * 100);

					args.bytesParagraphRef.current.textContent = `${prettyBytes(
						progressEvent.loaded,
					)} / ${prettyBytes(progressEvent.total ?? NaN)}  \u2014  (${percent}%)`;

					args.progressRef.current.value = percent;
				},
			});

			const pdfActionOutput = generateUploadUrlResponse.data.action_output;

			if (pdfActionOutput) {
				const pdf = (
					pdfActionOutput.notebook_updates?.[0] as
						| UpdateBlockResponseAction
						| undefined
				)?.action_payload.value as
					| NonNullable<BlockPDF["custom_block_info"]>["pdf"]
					| undefined;

				if (isValidNumber(pdf?.id)) {
					const fileUrl = URL.createObjectURL(args.file);

					ctx.client.setQueryData(
						queryKeyFactory.get["pdf-file-by-id"](pdf.id).queryKey,
						{
							fileName: args.file.name,
							fileUrl,
						},
					);
				} else {
					console.warn("PDF id is not valid from response", {
						pdfActionOutput,
					});
				}

				applyNotebookResponseUpdates({
					organizationId,
					response: {
						updates: pdfActionOutput.notebook_updates ?? [],
						bot_conversation_id: botConversationId,
						timestamp: createISODate(),
						project_id: notebookId,
					},
				});

				// Workaround to make sure the update is picked up:
				setNotebook(notebookId, (prev) => {
					return structuredClone(prev);
				});
			} else {
				console.warn("PDF action output is not valid from response", {
					pdfActionOutput,
				});
			}

			return null;
		},
	});
}

export function useIsUploadingPdfToNotebookBlock(blockUuid: NotebookBlockUuid) {
	return (
		useIsMutating({
			mutationKey:
				queryKeyFactory.post["block-request"]._ctx["upload-pdf"](blockUuid)
					.queryKey,
		}) > 0
	);
}
