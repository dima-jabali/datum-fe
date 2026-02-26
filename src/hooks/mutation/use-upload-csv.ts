import { useIsMutating, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

import { clientAPI_V1 } from "#/api/axios";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { createISODate, fileToTextString, prettyBytes } from "#/lib/utils";
import type { ISODateString } from "#/types/general";
import type { NotebookBlockUuid } from "#/types/notebook";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";

type GeneratePresignedUploadUrlActionInfo = {
	file_name: string;
};

type GeneratePresignedUploadUrlAction = {
	action_type: PostBlockActionType.GeneratePresignedUploadUrl;
	action_info: GeneratePresignedUploadUrlActionInfo;
	timestamp: ISODateString;
};

type GeneratePresignedUploadURLResponse = PostBlockResponse<{
	upload_url: string;
}>;

type UploadCsvRequest = {
	bytesParagraphRef: React.RefObject<HTMLParagraphElement | null>;
	progressRef: React.RefObject<HTMLProgressElement | null>;
	blockUuid: NotebookBlockUuid;
	file: File;
};

type UploadCsvResponse = null;

export function useUploadCsv(blockUuid: NotebookBlockUuid) {
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();

	const mutationKey = useMemo(
		() =>
			queryKeyFactory.post["block-request"]._ctx["upload-csv"](blockUuid)
				.queryKey,
		[blockUuid],
	);

	return useMutation<UploadCsvResponse, Error, UploadCsvRequest>({
		mutationKey,

		meta: {
			errorTitle: "Error uploading CSV file!",
		},

		mutationFn: async (args) => {
			const action: GeneratePresignedUploadUrlAction = {
				action_type: PostBlockActionType.GeneratePresignedUploadUrl,
				action_info: { file_name: args.file.name },
				timestamp: createISODate(),
			};

			const generateUploadUrlResponse =
				await clientAPI_V1.post<GeneratePresignedUploadURLResponse>(
					`/blocks/${args.blockUuid}/action`,
					action,
				);

			if (generateUploadUrlResponse.data.action_output?.error) {
				throw new Error(generateUploadUrlResponse.data.action_output.error);
			}

			const uploadUrl = generateUploadUrlResponse.data.action_output.upload_url;

			if (!uploadUrl) {
				throw new Error("No upload url!");
			}

			const text = await fileToTextString(args.file);

			await axios.put(uploadUrl, text, {
				headers: {
					"Content-Type": "text/csv",
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

			const actionOutput = generateUploadUrlResponse.data.action_output;

			if (actionOutput) {
				applyNotebookResponseUpdates({
					organizationId,
					response: {
						updates: actionOutput.notebook_updates ?? [],
						bot_conversation_id: botConversationId,
						timestamp: createISODate(),
						project_id: notebookId,
					},
				});
			} else {
				console.warn("CSV action output is not valid from response", {
					actionOutput,
				});
			}

			return null;
		},
	});
}

export function useIsUploadingCsv(blockUuid: NotebookBlockUuid) {
	return (
		useIsMutating({
			mutationKey:
				queryKeyFactory.post["block-request"]._ctx["upload-csv"](blockUuid)
					.queryKey,
		}) > 0
	);
}
