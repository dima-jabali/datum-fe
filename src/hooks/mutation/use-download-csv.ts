import { useMutation } from "@tanstack/react-query";

import type { ISODateString } from "#/types/general";
import type { BlockFilterAndSort } from "#/types/notebook";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import { createISODate } from "#/lib/utils";

export type DownloadCsvAction = {
	action_type: PostBlockActionType.DownloadCsv;
	action_info: {
		filters?: BlockFilterAndSort;
	};
	timestamp: ISODateString;
};

type DownloadCsvRequest = {
	action_info: DownloadCsvAction["action_info"];
	blockUuid: string;
};

type DownloadCsvResponse = PostBlockResponse<{ download_url: string }>;

const mutationKey =
	queryKeyFactory.post["block-request"]._ctx["download-csv"].queryKey;

export function useDownloadCsv() {
	return useMutation<Response, Error, DownloadCsvRequest>({
		mutationKey,

		async mutationFn(args) {
			const downloadCsvAction: DownloadCsvAction = {
				action_type: PostBlockActionType.DownloadCsv,
				action_info: args.action_info,
				timestamp: createISODate(),
			};

			const response = await clientAPI_V1.post<DownloadCsvResponse>(
				`/blocks/${args.blockUuid}/action`,
				downloadCsvAction,
			);

			if (response.data.action_output.error) {
				throw new Error(response.data.action_output.error);
			}

			if (!response.data.action_output.download_url) {
				throw new Error("No download url!");
			}

			const csvResponse = await fetch(response.data.action_output.download_url);

			if (response.status !== 200) {
				throw new Error(
					`HTTP error downloading CSV from download_url! status: ${response.status}`,
				);
			}

			return csvResponse;
		},

		meta: {
			errorTitle: "Error downloading CSV file!",
		},
	});
}
