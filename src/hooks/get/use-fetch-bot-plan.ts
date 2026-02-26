import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Plan } from "#/types/chat";
import type { PatchProjectResponseAction } from "#/types/post-block-update";
import { identity } from "#/lib/utils";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type GetBotPlanResponse = {
	updates: Array<PatchProjectResponseAction> | null;
	plan?: Plan | null;
	has_plan: boolean;
};

export function useFetchBotPlan<SelectedData = GetBotPlanResponse["plan"]>(
	select: (data: GetBotPlanResponse["plan"]) => SelectedData = identity<
		GetBotPlanResponse["plan"],
		SelectedData
	>,
) {
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();

	const queryOptions = useMemo(
		() =>
			queryKeyFactory.get["bot-plan"](
				botConversationId,
				organizationId,
				notebookId,
			),
		[botConversationId, notebookId, organizationId],
	);

	return useSuspenseQuery({
		refetchOnWindowFocus: false,
		select,
		...queryOptions,
	});
}
