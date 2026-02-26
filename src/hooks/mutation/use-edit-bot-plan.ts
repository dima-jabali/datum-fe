import { useMutation } from "@tanstack/react-query";

import type { Plan, PlanStep } from "#/types/chat";
import type { BotConversationId, NotebookId } from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import type { PatchProjectResponseAction } from "#/types/post-block-update";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { createISODate } from "#/lib/utils";
import { setBotPlan } from "#/lib/query-client-helpers";

export type EditBotPlanRequestProps = {
	bot_conversation_id: BotConversationId;
	organizationId: OrganizationId;
	notebookId: NotebookId;
	body: {
		/** Should be the whole plan */
		sub_tasks: {
			is_current_task?: boolean;
			sub_tasks?: PlanStep[];
			task?: string;
		}[];
		execute_plan: boolean;
		approved: boolean;
	};
};

type EditBotPlanResponse = {
	updates: PatchProjectResponseAction[] | null;
	plan: Plan | null;
	has_plan: boolean;
};

const mutationKey = queryKeyFactory.post["edit-bot-plan"].queryKey;

export function useEditBotPlan() {
	return useMutation({
		mutationKey,

		async mutationFn(props: EditBotPlanRequestProps) {
			const res = await clientAPI_V1.put<EditBotPlanResponse>(
				`/bot-conversations/${props.bot_conversation_id}/active-plan`,
				props.body,
			);

			return res.data;
		},

		onSuccess(response, variables) {
			setBotPlan(
				variables.bot_conversation_id,
				variables.organizationId,
				variables.notebookId,
				response.plan || undefined,
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
			successTitle: "Bot's plan edited successfully!",
			errorTitle: "Failed to edit bot's plan!",
		},
	});
}
