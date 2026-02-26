import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import { usePatchNotebookBlocks } from "#/hooks/mutation/use-patch-notebook-blocks";
import { useBlockStore } from "#/contexts/block-context";
import {
	PostBlockActionType,
	type PostBlockResponse,
} from "#/types/post-block-update";
import {
	KernelResultsTypes,
	NotebookActionType,
	UpdateBlockActionKey,
	type BlockPython,
	type NotebookBlockUuid,
} from "#/types/notebook";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import { createISODate } from "#/lib/utils";
import { FIXED_PYTHON_KERNEL_MSG } from "#/components/blocks/helpers";

type FixPythonActionInfo = {
	error: string;
	code: string;
};

type FixPythonAction = {
	action_type: PostBlockActionType.FixPython;
	action_info: FixPythonActionInfo;
};

type FixPythonResponse = SuccessResponse | ErrorResponse;
type SuccessResponse = PostBlockResponse<{
	variables_to_display: Array<string>;
	notes: Array<string>;
	fixed_code: string;
}>;
type ErrorResponse = PostBlockResponse<{ error: string }>;

export function useFixPython() {
	const blockStore = useBlockStore();

	const patchNotebookBlocks = usePatchNotebookBlocks().mutateAsync;
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();
	const blockUuid = blockStore.use.blockUuid();

	const mutationKey = useMemo(
		() =>
			queryKeyFactory.post["block-request"]._ctx["fix-python"](blockUuid)
				.queryKey,
		[blockUuid],
	);

	return useMutation({
		mutationKey,

		async mutationFn() {
			const { kernelResults, getLatestValue } = blockStore.getState();

			const newCode = (getLatestValue() as BlockPython).custom_block_info?.code;

			if (!newCode) {
				throw new Error("No python code found or it is empty!");
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

			const action: FixPythonAction = {
				action_type: PostBlockActionType.FixPython,
				action_info: {
					error: errorsAsString,
					code: newCode,
				},
			};

			const res = await clientAPI_V1.post<FixPythonResponse>(path, action);

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
							value: res.data.action_output.fixed_code,
							key: UpdateBlockActionKey.Code,
							block_uuid: blockUuid,
						},
					},
				],
			});

			return res.data;
		},

		onSuccess() {
			blockStore.setState({ kernelResults: [FIXED_PYTHON_KERNEL_MSG] });
		},

		meta: {
			errorTitle: "Error fixing Python code!",
		},
	});
}

export function useIsFixingPython(blockUuid: NotebookBlockUuid) {
	const queryOptions = useMemo(
		() => ({
			mutationKey:
				queryKeyFactory.post["block-request"]._ctx["fix-python"](blockUuid)
					.queryKey,
		}),
		[blockUuid],
	);

	return useIsMutating(queryOptions) > 0;
}

function isError(res: FixPythonResponse): res is ErrorResponse {
	return !!res.action_output.error;
}
