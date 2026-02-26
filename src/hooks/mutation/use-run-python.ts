import { useIsMutating, useMutation } from "@tanstack/react-query";

import { clientAPI_V1 } from "#/api/axios";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { createISODate } from "#/lib/utils";
import type { KernelResult, NotebookBlockUuid } from "#/types/notebook";
import {
	PostBlockActionType,
	type PaginateDataframeOutput,
	type PostBlockResponse,
} from "#/types/post-block-update";

type RunPythonBlockActionInfo = {
	code: string;
};

type RunPythonBlockAction = {
	action_type: PostBlockActionType.RunPythonBlock;
	action_info: RunPythonBlockActionInfo;
};

type RunPythonRequest = {
	action_info: RunPythonBlockActionInfo;
};

type RunPythonResponse = PostBlockResponse<
	PaginateDataframeOutput<KernelResult>
>;

export function useRunPython(blockUuid: NotebookBlockUuid) {
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();

	return useMutation<RunPythonResponse, Error, RunPythonRequest>({
		mutationKey:
			queryKeyFactory.post["block-request"]._ctx["run-python"](blockUuid)
				.queryKey,

		meta: {
			errorTitle: "Error running Python code!",
		},

		async mutationFn(args) {
			const action: RunPythonBlockAction = {
				action_type: PostBlockActionType.RunPythonBlock,
				action_info: args.action_info,
			};

			const res = await clientAPI_V1.post<RunPythonResponse>(
				`/blocks/${blockUuid}/action`,
				action,
			);

			if (res.data.action_output?.error) {
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

export function useIsRunningPython(blockUuid: NotebookBlockUuid) {
	return (
		useIsMutating({
			mutationKey:
				queryKeyFactory.post["block-request"]._ctx["run-python"](blockUuid)
					.queryKey,
		}) > 0
	);
}
