import { useMutation } from "@tanstack/react-query";

import { queryKeyFactory } from "#/hooks/query-key-factory";
import {
	useEditBotPlan,
	type EditBotPlanRequestProps,
} from "#/hooks/mutation/use-edit-bot-plan";

const mutationKey = queryKeyFactory.post["approve-bot-plan"].queryKey;

export function useApproveBotPlan() {
	const editBotPlan = useEditBotPlan();

	return useMutation({
		mutationKey,

		async mutationFn(props: EditBotPlanRequestProps) {
			return await editBotPlan.mutateAsync(props);
		},

		meta: {
			successTitle: "Bot's plan approved successfully!",
			errorTitle: "Failed to approve bot's plan!",
		},
	});
}
