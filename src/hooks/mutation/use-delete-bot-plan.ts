import { useMutation } from "@tanstack/react-query";

import type { BotConversationId, NotebookId } from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import type { PatchProjectResponseAction } from "#/types/post-block-update";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import { setBotPlan } from "#/lib/query-client-helpers";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { createISODate } from "#/lib/utils";

export type DeleteBotPlanRequestProps = {
	bot_conversation_id: BotConversationId;
	organizationId: OrganizationId;
	notebookId: NotebookId;
};

type DeleteActivePlanResponse = {
	updates: PatchProjectResponseAction[] | null;
};

const mutationKey = queryKeyFactory.delete["bot-plan"].queryKey;

export function useDeleteBotPlan() {
	return useMutation({
		mutationKey,

		async mutationFn(props: DeleteBotPlanRequestProps) {
			const path = `/bot-conversations/${props.bot_conversation_id}/active-plan`;

			const res = await clientAPI_V1.delete<DeleteActivePlanResponse>(path);

			return res.data;
		},

		onSuccess(response, variables) {
			setBotPlan(
				variables.bot_conversation_id,
				variables.organizationId,
				variables.notebookId,
				undefined,
			);

			if (response.updates && response.updates.length > 0) {
				applyNotebookResponseUpdates({
					organizationId: variables.organizationId,
					response: {
						bot_conversation_id: variables.bot_conversation_id,
						project_id: variables.notebookId,
						timestamp: createISODate(),
						updates: response.updates,
					},
				});
			}
		},

		meta: {
			successTitle: "Bot's plan deleted successfully!",
			errorTitle: "Failed to delete bot's plan!",
		},
	});
}
