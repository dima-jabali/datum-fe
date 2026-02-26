import { useIsMutating, useMutation } from "@tanstack/react-query";

import type { ISODateString } from "#/types/general";
import type { NotebookBlockUuid } from "#/types/notebook";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { createISODate } from "#/lib/utils";
import { clientAPI_V1 } from "#/api/axios";

export type IndexPDFAction = {
	action_type: PostBlockActionType.IndexPDF;
	action_info: Record<never, never>;
	timestamp: ISODateString;
};

type IndexPdfRequest = {
	blockUuid: NotebookBlockUuid;
};

type IndexPdfResponse = PostBlockResponse<void>;

export function useIndexPdf(blockUuid: NotebookBlockUuid) {
	return useMutation<IndexPdfResponse, Error, IndexPdfRequest>({
		mutationKey:
			queryKeyFactory.post["block-request"]._ctx["index-pdf"](blockUuid)
				.queryKey,

		async mutationFn(args) {
			const indexPdfAction: IndexPDFAction = {
				action_type: PostBlockActionType.IndexPDF,
				timestamp: createISODate(),
				action_info: {},
			};

			const indexPdfResponse = await clientAPI_V1.post<IndexPdfResponse>(
				`/blocks/${args.blockUuid}/action`,
				indexPdfAction,
			);

			return indexPdfResponse.data;
		},

		meta: {
			errorTitle: "Error indexing PDF file!",
		},
	});
}

export function useIsIndexingPdf(blockUuid: NotebookBlockUuid) {
	return (
		useIsMutating({
			mutationKey:
				queryKeyFactory.post["block-request"]._ctx["index-pdf"](blockUuid)
					.queryKey,
		}) > 0
	);
}
