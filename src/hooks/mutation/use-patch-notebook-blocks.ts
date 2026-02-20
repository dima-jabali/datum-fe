import { useMutation, type QueryClient } from "@tanstack/react-query";

import type { ISODateString } from "#/types/general";
import {
	type BotConversationId,
	type NotebookId,
	type PatchNotebookAction,
} from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import {
	applyNotebookRequestUpdates,
	applyNotebookResponseUpdates,
} from "#/lib/apply-notebook-response-updates";
import type { PatchProjectResponseAction } from "#/types/post-block-update";

type PatchProjectResponse = {
	bot_conversation_id?: BotConversationId | null;
	updates: Array<PatchProjectResponseAction>;
	timestamp: ISODateString;
	project_id?: NotebookId;
};

type PatchNotebookRequest = {
	botConversationId: BotConversationId;
	updates: Array<PatchNotebookAction>;
	organizationId: OrganizationId;
	timestamp: ISODateString;
	notebookId: NotebookId;
};

const mutationKey = queryKeyFactory.patch["notebook-blocks"].queryKey;

export function usePatchNotebookBlocks() {
	return useMutation<PatchProjectResponse, Error, PatchNotebookRequest>({
		mutationKey,
	});
}

export function setMutationDefaults_patchNotebookBlocks(
	queryClient: QueryClient,
) {
	queryClient.setMutationDefaults(mutationKey, {
		mutationFn: async (args: PatchNotebookRequest) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { notebookId, botConversationId, ...body } = args;

			const res = await clientAPI_V1.patch<PatchProjectResponse>(
				`/projects/${notebookId}`,
				body,
			);

			return res.data;
		},

		onMutate(args) {
			applyNotebookRequestUpdates({
				organizationId: args.organizationId,
				request: {
					bot_conversation_id: args.botConversationId,
					project_id: args.notebookId,
					timestamp: args.timestamp,
					updates: args.updates,
				},
			});
		},

		onSuccess(response, args) {
			applyNotebookResponseUpdates({
				organizationId: args.organizationId,
				response: {
					bot_conversation_id: args.botConversationId,
					timestamp: response.timestamp,
					project_id: args.notebookId,
					updates: response.updates,
				},
			});
		},
	});
}
