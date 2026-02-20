import {
	useSuspenseInfiniteQuery,
	type InfiniteData,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useWithBotConversationId } from "#/contexts/general/ctx";
import { identity } from "#/lib/utils";
import type { BotConversationMessage } from "#/types/chat";
import type { PageLimit, PageOffset } from "#/types/general";
import type { BotConversationId } from "#/types/notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { useGetBotConversation } from "#/hooks/get/use-get-bot-conversation";

export type GetBotConversationMessagesPageRequest = {
	/** If not present, will be as 'true'. */
	botConversationId: BotConversationId;
	visible_to_user?: "true" | "false";
	offset: PageOffset;
	limit: PageLimit;
};

export type GetBotConversationMessagesPageResponse = {
	results: Array<BotConversationMessage>;
	num_results: number;
	offset: PageOffset;
	limit: PageLimit;
};

export type SelectedBotConversationMessageListPage<
	SelectedData = BotConversationMessageListPageInfiniteResponse,
> = (data: BotConversationMessageListPageInfiniteResponse) => SelectedData;

export function useGetBotConversationMessageListPage<
	SelectedData = BotConversationMessageListPageInfiniteResponse,
>(
	select: SelectedBotConversationMessageListPage<SelectedData> = identity<
		BotConversationMessageListPageInfiniteResponse,
		SelectedData
	>,
) {
	useGetBotConversation();

	const botConversationId = useWithBotConversationId();

	const { queryOptions, initialPageParam } = useMemo(() => {
		const initialPageParam: GetBotConversationMessagesPageRequest = {
			visible_to_user: "true",
			limit: 100 as PageLimit,
			offset: 0 as PageOffset,
			botConversationId,
		};

		const queryOptions =
			queryKeyFactory.get["bot-conversation-message-list-page"](
				botConversationId,
			);

		return { queryOptions, initialPageParam };
	}, [botConversationId]);

	return useSuspenseInfiniteQuery({
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		gcTime: Infinity, // Maintain on cache
		initialPageParam,
		...queryOptions,
		select,
		getNextPageParam(lastPage, _allPages, lastPageParams) {
			const nextOffset = (lastPageParams.offset +
				lastPageParams.limit) as PageOffset;

			if (lastPage && nextOffset > lastPage.num_results) return;

			return { ...lastPageParams, offset: nextOffset };
		},
		getPreviousPageParam(_firstPage, _allPages, firstPageParams) {
			const prevOffset = (firstPageParams.offset -
				firstPageParams.limit) as PageOffset;

			if (prevOffset < 0) return;

			return { ...firstPageParams, offset: prevOffset };
		},
	});
}

export function selectHasAnyBotConversationMessage(
	data: BotConversationMessageListPageInfiniteResponse,
) {
	const results = data.pages[0]?.results;

	if (!results) {
		return false;
	}

	const { length } = results;

	if (length === 0) {
		return false;
	}

	return true;
}

export function useHasAnyMessage() {
	return useGetBotConversationMessageListPage(
		selectHasAnyBotConversationMessage,
	).data;
}

export type BotConversationMessageListPageInfiniteResponse = InfiniteData<
	GetBotConversationMessagesPageResponse,
	GetBotConversationMessagesPageRequest
>;
