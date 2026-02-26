import { useMutation } from "@tanstack/react-query";

import type { ISODateString } from "#/types/general";
import type { BlockFilterAndSort } from "#/types/notebook";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { createISODate } from "#/lib/utils";
import { clientAPI_V1 } from "#/api/axios";

type DownloadSqlActionInfo = {
	filters?: BlockFilterAndSort;
};

export type DownloadSqlAction = {
	action_type: PostBlockActionType.DownloadSql;
	action_info: DownloadSqlActionInfo;
	timestamp: ISODateString;
};

type DownloadSqlRequest = {
	action_info: DownloadSqlAction["action_info"];
	blockUuid: string;
};

type DownloadSqlResponse = PostBlockResponse<{ download_url: string }>;

const mutationKey =
	queryKeyFactory.post["block-request"]._ctx["download-sql"].queryKey;

export function useDownloadSql() {
	return useMutation<Response, Error, DownloadSqlRequest>({
		mutationKey,

		async mutationFn(args) {
			const downloadCsvAction: DownloadSqlAction = {
				action_type: PostBlockActionType.DownloadSql,
				action_info: args.action_info,
				timestamp: createISODate(),
			};

			const response = await clientAPI_V1.post<DownloadSqlResponse>(
				`/blocks/${args.blockUuid}/action`,
				downloadCsvAction,
			);

			if (response.data.action_output.error) {
				throw new Error(response.data.action_output.error);
			}

			if (!response.data.action_output.download_url) {
				throw new Error("No download url!");
			}

			const sqlResponse = await fetch(response.data.action_output.download_url);

			if (response.status !== 200) {
				throw new Error(
					`HTTP error downloading sql from download_url! status: ${response.status}`,
				);
			}

			return sqlResponse;
		},

		meta: {
			errorTitle: "Error downloading SQL!",
		},
	});
}
