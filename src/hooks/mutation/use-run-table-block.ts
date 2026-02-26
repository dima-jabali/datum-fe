import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { useBlockStore } from "#/contexts/block-context";
import type { BlockFilterAndSort } from "#/types/notebook";
import {
	PostBlockActionType,
	type PaginateDataframeOutput,
	type PostBlockResponse,
} from "#/types/post-block-update";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { createISODate } from "#/lib/utils";

type RunTableBlockActionInfo = {
	filters: BlockFilterAndSort;
	offset: number;
	limit: number;
};

type RunTableBlockAction = {
	action_type: PostBlockActionType.RunTableBlock;
	action_info: RunTableBlockActionInfo;
};

type RunSqlRequestRequest = {
	action_info: RunTableBlockActionInfo;
};

type RunTableBlockResponse = SuccessResponse | ErrorResponse;
type SuccessResponse<T = unknown> = PostBlockResponse<
	PaginateDataframeOutput<T>
>;
type ErrorResponse = PostBlockResponse<{ error: string }>;

export function useRunTableBlock() {
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();
	const blockStore = useBlockStore();
	const blockUuid = blockStore.use.blockUuid();

	const [mutationKey] = useState(
		() =>
			queryKeyFactory.post["block-request"]._ctx["run-table-block"](blockUuid)
				.queryKey,
	);

	return useMutation({
		mutationKey,

		meta: {
			errorTitle: "Error running Table block!",
		},

		async mutationFn(args: RunSqlRequestRequest) {
			const action: RunTableBlockAction = {
				action_type: PostBlockActionType.RunTableBlock,
				action_info: args.action_info,
			};

			const res = await clientAPI_V1.post<RunTableBlockResponse>(
				`/blocks/${blockUuid}/action`,
				action,
			);

			if (isError(res.data)) {
				throw new Error(res.data.action_output.error);
			}

			applyNotebookResponseUpdates({
				organizationId,
				response: {
					updates: res.data.action_output.notebook_updates ?? [],
					bot_conversation_id: botConversationId,
					timestamp: createISODate(),
					project_id: notebookId,
				},
			});

			return res.data;
		},
	});
}

function isError(res: RunTableBlockResponse): res is ErrorResponse {
	return !!res.action_output.error;
}
