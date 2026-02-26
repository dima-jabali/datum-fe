import { useMutation } from "@tanstack/react-query";

import type { ISODateString } from "#/types/general";
import type { BlockFilterAndSort, NotebookBlockUuid } from "#/types/notebook";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { createISODate } from "#/lib/utils";
import { clientAPI_V1 } from "#/api/axios";

type PaginateDataFrameActionInfo = {
	filters: BlockFilterAndSort;
	offset: number;
	limit: number;
};

type PaginateDataFrameAction = {
	action_type: PostBlockActionType.PaginateDataframe;
	action_info: PaginateDataFrameActionInfo;
	timestamp: ISODateString;
};

type PaginateDataframeRequest = {
	action_info: PaginateDataFrameAction["action_info"];
	blockUuid: NotebookBlockUuid;
};

export type PaginateDataframeOutput<T = unknown> = {
	num_rows: number;
	data: T[];
};

type PaginateDataframeResponse<T = unknown> = PostBlockResponse<
	PaginateDataframeOutput<T>
>;

const mutationKey =
	queryKeyFactory.post["block-request"]._ctx["paginate-dataframe"].queryKey;

export function usePaginateDataframe() {
	return useMutation<
		PaginateDataframeResponse,
		Error,
		PaginateDataframeRequest
	>({
		mutationKey,

		async mutationFn(args) {
			const paginateAction: PaginateDataFrameAction = {
				action_type: PostBlockActionType.PaginateDataframe,
				action_info: args.action_info,
				timestamp: createISODate(),
			};

			const res = await clientAPI_V1.post<PaginateDataframeResponse>(
				`/blocks/${args.blockUuid}/action`,
				paginateAction,
			);

			return res.data;
		},

		meta: {
			errorTitle: "Error paginating dataframe!",
		},
	});
}
