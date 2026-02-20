import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { BotConversation } from "#/types/notebook";
import { identity } from "#/lib/utils";
import { useWithBotConversationId } from "#/contexts/general/ctx";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type GetBotConversationByIdResponse = BotConversation;

export function useGetBotConversation<SelectedData = BotConversation>(
	select: (data: BotConversation) => SelectedData = identity<
		BotConversation,
		SelectedData
	>,
) {
	const botConversationId = useWithBotConversationId();

	const queryOptions = useMemo(
		() => queryKeyFactory.get["bot-conversation"](botConversationId),
		[botConversationId],
	);

	return useSuspenseQuery({
		gcTime: Infinity, // Maintain on cache
		...queryOptions,
		select,
	}).data;
}

function selectIsStreaming(data: BotConversation) {
	return data.is_streaming;
}
export function useIsStreaming() {
	return useGetBotConversation(selectIsStreaming);
}
