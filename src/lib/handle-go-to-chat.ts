import { generalCtx } from "#/contexts/general/ctx";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import type { BotConversationId, NotebookId } from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import { isValidNumber, noop, OPTIMISTIC_NEW_NOTEBOOK_ID } from "#/lib/utils";
import { queryClient } from "#/contexts/query-client";
import type { GetBotConversationMessagesPageRequest } from "#/hooks/get/use-get-bot-conversation-message-list-page";
import type { PageLimit, PageOffset } from "#/types/general";

export function handleGoToChat(
	notebookId: NotebookId,
	botConversationId: BotConversationId | null,
) {
	const { notebookId: notebookIdFromStore } = generalCtx.getState();

	if (notebookId === notebookIdFromStore) {
		return;
	}

	generalCtx.setState({
		botConversationId,
		notebookId,
	});
}

export function handlePrefetchChat(
	notebookId: NotebookId,
	botConversationId: BotConversationId | null,
	organizationId: OrganizationId,
) {
	const isOptimisticNewNotebook = notebookId === OPTIMISTIC_NEW_NOTEBOOK_ID;

	if (!isOptimisticNewNotebook) {
		queryClient
			.prefetchQuery(queryKeyFactory.get["notebook-by-id"](notebookId))
			.catch(noop);

		queryClient
			.prefetchQuery(
				queryKeyFactory.get["settings"](organizationId, notebookId),
			)
			.catch(noop);

		if (isValidNumber(botConversationId)) {
			queryClient
				.prefetchQuery(
					queryKeyFactory.get["bot-conversation"](botConversationId),
				)
				.catch(noop);

			const initialPageParam: GetBotConversationMessagesPageRequest = {
				visible_to_user: "true",
				limit: 100 as PageLimit,
				offset: 0 as PageOffset,
				botConversationId,
			};

			queryClient
				.prefetchInfiniteQuery({
					...queryKeyFactory.get["bot-conversation-message-list-page"](
						botConversationId,
					),
					initialPageParam,
				})
				.catch(noop);
		}
	}
}
