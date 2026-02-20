import type { Updater } from "@tanstack/react-query";

import { queryClient } from "#/contexts/query-client";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import type {
	BotConversation,
	BotConversationId,
	Notebook,
	NotebookId,
} from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import type { BotConversationMessageListPageInfiniteResponse } from "#/hooks/get/use-get-bot-conversation-message-list-page";
import type { FetchNotebookListPageInfiniteData } from "#/hooks/get/use-get-notebook-list-page";

export function setBotConversation(
	botConversationId: BotConversationId,
	newBotConversation: Updater<
		BotConversation | undefined,
		BotConversation | undefined
	>,
) {
	return queryClient.setQueryData<BotConversation>(
		queryKeyFactory.get["bot-conversation"](botConversationId).queryKey,
		newBotConversation,
	);
}

export function getBotConversation(botConversationId: BotConversationId) {
	return queryClient.getQueryData<BotConversation>(
		queryKeyFactory.get["bot-conversation"](botConversationId).queryKey,
	);
}

export function getNotebook(notebookId: NotebookId) {
	return queryClient.getQueryData<Notebook>(
		queryKeyFactory.get["notebook-by-id"](notebookId).queryKey,
	);
}

export function setNotebook(
	notebookId: NotebookId,
	newNotebook: Updater<Notebook | undefined, Notebook | undefined>,
) {
	return queryClient.setQueryData<Notebook>(
		queryKeyFactory.get["notebook-by-id"](notebookId).queryKey,
		newNotebook,
	);
}

export function getNotebookListPages(organizationId: OrganizationId) {
	return queryClient.getQueryData<FetchNotebookListPageInfiniteData>(
		queryKeyFactory.get["notebook-list-page"](organizationId).queryKey,
	);
}

export function setNotebookListPages(
	organizationId: OrganizationId,
	newList: Updater<
		FetchNotebookListPageInfiniteData | undefined,
		FetchNotebookListPageInfiniteData | undefined
	>,
) {
	queryClient.setQueryData<FetchNotebookListPageInfiniteData>(
		queryKeyFactory.get["notebook-list-page"](organizationId).queryKey,
		newList,
	);
}

export function getBotConversationMessageListPages(
	botConversationId: BotConversationId,
) {
	return queryClient.getQueryData<BotConversationMessageListPageInfiniteResponse>(
		queryKeyFactory.get["bot-conversation-message-list-page"](botConversationId)
			.queryKey,
	);
}

export function setBotConversationMessageListPages(
	botConversationId: BotConversationId,
	newList: Updater<
		BotConversationMessageListPageInfiniteResponse | undefined,
		BotConversationMessageListPageInfiniteResponse | undefined
	>,
) {
	queryClient.setQueryData<BotConversationMessageListPageInfiniteResponse>(
		queryKeyFactory.get["bot-conversation-message-list-page"](botConversationId)
			.queryKey,
		newList,
	);
}
