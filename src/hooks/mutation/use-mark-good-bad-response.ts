import {
	useMutation,
	type MutationObserverOptions,
	type QueryClient,
} from "@tanstack/react-query";

import { clientAPI_V1 } from "#/api/axios";
import { setBotConversationMessageListPages } from "#/lib/query-client-helpers";
import type {
	BotConversationMessage,
	BotConversationMessageId,
} from "#/types/chat";
import type { BotConversationId } from "#/types/notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type MarkResponseAsGoodOrBadRequest = {
	botConversationMessageId: BotConversationMessageId;
	botConversationId: BotConversationId;
	thumbs_up: boolean | null;
	feedback_text: string;
};

export type MarkResponseAsGoodOrBadResponse = BotConversationMessage;

const mutationKey = queryKeyFactory.post["mark-good-bad-response"].queryKey;

export function useMarkGoodBadResponse() {
	return useMutation<
		MarkResponseAsGoodOrBadResponse,
		Error,
		MarkResponseAsGoodOrBadRequest
	>({
		mutationKey,
	});
}

export function setMutationDefaults_markGoodBadResponse(
	queryClient: QueryClient,
) {
	queryClient.setMutationDefaults(mutationKey, {
		mutationFn: async (args) => {
			const { botConversationId, botConversationMessageId, ...body } = args;
			const path = `bot-conversations/${botConversationId}/messages/${botConversationMessageId}/feedback`;

			const res = await clientAPI_V1.post<MarkResponseAsGoodOrBadResponse>(
				path,
				body,
			);

			return res.data;
		},

		onMutate(args) {
			const { botConversationId, botConversationMessageId } = args;

			setBotConversationMessageListPages(botConversationId, (prevData) => {
				if (!prevData) return prevData;

				const ret: typeof prevData = {
					...prevData,
					pages: prevData.pages.map((page) => {
						return {
							...page,
							results: page.results.map((result) => {
								if (result.id === botConversationMessageId) {
									return {
										...result,
										feedback_text: args.feedback_text,
										thumbs_up: args.thumbs_up,
									};
								}

								return result;
							}),
						};
					}),
				};

				return ret;
			});
		},

		onSuccess(updatedBotConversationMessage, args) {
			const { botConversationId, botConversationMessageId } = args;

			setBotConversationMessageListPages(botConversationId, (prevData) => {
				if (!prevData) return prevData;

				const ret: typeof prevData = {
					...prevData,
					pages: prevData.pages.map((page) => {
						return {
							...page,
							results: page.results.map((result) => {
								if (result.id === botConversationMessageId) {
									return updatedBotConversationMessage;
								}

								return result;
							}),
						};
					}),
				};

				return ret;
			});
		},

		meta: {
			errorTitle: "Failed to mark response as good or bad!",
		},
	} satisfies MutationObserverOptions<
		MarkResponseAsGoodOrBadResponse,
		Error,
		MarkResponseAsGoodOrBadRequest
	>);
}
