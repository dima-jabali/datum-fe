import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
	KernelResultsTypes,
	NotebookActionType,
	UpdateBlockActionKey,
	type BlockSql,
	type NotebookBlockUuid,
} from "#/types/notebook";
import { usePatchNotebookBlocks } from "#/hooks/mutation/use-patch-notebook-blocks";
import { useBlockStore } from "#/contexts/block-context";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import { createISODate } from "#/lib/utils";
import { FIXED_SQL_KERNEL_MSG } from "#/components/blocks/helpers";

type FixSqlActionInfo = {
	error: string;
	sql: string;
};

type FixSqlAction = {
	action_type: PostBlockActionType.FixSql;
	action_info: FixSqlActionInfo;
};

type FixSqlResponse = SuccessResponse | ErrorResponse;
type SuccessResponse = PostBlockResponse<{
	variables_to_display: Array<string>;
	notes: Array<string>;
	fixed_sql: string;
}>;
type ErrorResponse = PostBlockResponse<{ error: string }>;

export function useFixSql() {
	const blockStore = useBlockStore();

	const patchNotebookBlocks = usePatchNotebookBlocks().mutateAsync;
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();
	const blockUuid = blockStore.use.blockUuid();

	const [mutationKey] = useState(
		() =>
			queryKeyFactory.post["block-request"]._ctx["fix-sql"](blockUuid).queryKey,
	);

	return useMutation({
		mutationKey,

		async mutationFn() {
			const { kernelResults, getLatestValue } = blockStore.getState();

			const newSqlCode = (getLatestValue() as BlockSql).custom_block_info
				?.query;

			if (!newSqlCode) {
				throw new Error("No SQL code found or it is empty!");
			}

			const errorsAsString = kernelResults
				.filter(
					(kernelResult) => kernelResult.type === KernelResultsTypes.ERROR,
				)
				.map((kernelResult) => kernelResult.value)
				.join("\n\n")
				.trim();

			if (!errorsAsString) {
				throw new Error("No error found to fix!");
			}

			const path = `/blocks/${blockUuid}/action`;

			const action: FixSqlAction = {
				action_type: PostBlockActionType.FixSql,
				action_info: {
					error: errorsAsString,
					sql: newSqlCode,
				},
			};

			const res = await clientAPI_V1.post<FixSqlResponse>(path, action);

			if (isError(res.data)) {
				throw new Error(res.data.action_output.error);
			}

			await patchNotebookBlocks({
				timestamp: createISODate(),
				botConversationId,
				organizationId,
				notebookId,
				updates: [
					{
						action_type: NotebookActionType.UpdateBlock,
						action_info: {
							value: res.data.action_output.fixed_sql,
							key: UpdateBlockActionKey.Code,
							block_uuid: blockUuid,
						},
					},
				],
			});

			return res.data;
		},

		onSuccess() {
			blockStore.setState({ kernelResults: [FIXED_SQL_KERNEL_MSG] });
		},

		meta: {
			errorTitle: "Error fixing SQL code!",
		},
	});
}

export function useIsFixingSql(blockUuid: NotebookBlockUuid) {
	const queryOptions = useMemo(
		() => ({
			mutationKey:
				queryKeyFactory.post["block-request"]._ctx["fix-sql"](blockUuid)
					.queryKey,
		}),
		[blockUuid],
	);

	return useIsMutating(queryOptions) > 0;
}

function isError(res: FixSqlResponse): res is ErrorResponse {
	return !!res.action_output.error;
}
