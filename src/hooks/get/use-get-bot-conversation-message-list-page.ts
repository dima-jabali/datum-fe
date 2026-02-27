import {
	useSuspenseInfiniteQuery,
	type InfiniteData,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useWithBotConversationId } from "#/contexts/general/ctx";
import { useGetBotConversation } from "#/hooks/get/use-get-bot-conversation";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { getSourceMainValues } from "#/lib/sources-for-user/get-source-main-values";
import {
	normalizeSources,
	type NormalizedSource,
} from "#/lib/sources-for-user/normalize-sources";
import type { SourceMainValuesContainer } from "#/lib/sources-for-user/source-main-values-container";
import { identity, isDev } from "#/lib/utils";
import type {
	BotConversationMessage,
	SourceForUserType,
	SourceID,
} from "#/types/chat";
import type { PageLimit, PageOffset } from "#/types/general";
import type { BotConversationId } from "#/types/notebook";

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

function selectAllChatSourcesMainValues(
	data: BotConversationMessageListPageInfiniteResponse,
) {
	const allSourcesMap = new Map<
		SourceID,
		SourceMainValuesContainer<
			SourceForUserType,
			NormalizedSource["values_type"]
		>
	>();

	if (data.pages.length === 0 || data.pages[0]?.results.length === 0) {
		return allSourcesMap;
	}

	const start = performance.now();

	// Get all sources
	for (const page of data.pages) {
		for (const msg of page.results) {
			if (msg.sources && msg.sources.length > 0) {
				const normalizedSources = normalizeSources(msg.sources);

				for (const source of normalizedSources) {
					const mainValues = getSourceMainValues(source);

					allSourcesMap.set(mainValues.id, mainValues);
				}
			}
		}
	}

	if (isDev) {
		const took = performance.now() - start;

		console.log({
			took,
			allSourcesMap,
			data,
		});
	}

	return allSourcesMap;
}
export function useAllChatSourcesMainValues() {
	return useGetBotConversationMessageListPage(selectAllChatSourcesMainValues)
		.data;
}

export type BotConversationMessageListPageInfiniteResponse = InfiniteData<
	GetBotConversationMessagesPageResponse,
	GetBotConversationMessagesPageRequest
>;
