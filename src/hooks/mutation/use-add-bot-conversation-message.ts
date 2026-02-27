import { useMutation } from "@tanstack/react-query";
import { invariant } from "es-toolkit";
import { toast } from "sonner";

import { clientAPI_V1 } from "#/api/axios";
import { generalCtx, useWithOrganizationId } from "#/contexts/general/ctx";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import {
	getBotConversation,
	setBotConversation,
	setBotConversationMessageListPages,
} from "#/lib/query-client-helpers";
import { createISODate, isValidNumber } from "#/lib/utils";
import {
	BotConversationMessageSenderType,
	BotConversationMessageStatus,
	BotConversationMessageType,
	type BotConversationMessage,
	type BotConversationMessageId,
	type BotConversationMessageUuid,
} from "#/types/chat";
import type {
	Base64Image,
	ISODateString,
	PageLimit,
	PageOffset,
} from "#/types/general";
import type {
	BotConversationId,
	ChatTools,
	NotebookBlockUuid,
	NotebookId,
} from "#/types/notebook";
import type { PatchProjectResponseAction } from "#/types/post-block-update";
import type { BotConversationMessageListPageInfiniteResponse } from "#/hooks/get/use-get-bot-conversation-message-list-page";
import { useGetUser } from "#/hooks/get/use-get-user";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type CreateABotConversationMessageResponse = {
	updates: Array<PatchProjectResponseAction>;
};

export enum MessageType {
	Image = "IMAGE",
	Text = "TEXT",
}

export type Message =
	| {
			uuid: BotConversationMessageUuid;
			type: MessageType.Text;
			text: string;
	  }
	| {
			uuid: BotConversationMessageUuid;
			type: MessageType.Image;
			image: Base64Image;
	  };

export type CreateABotConversationMessageRequest = {
	tools_to_use: Array<ChatTools> | undefined;
	botConversationId: BotConversationId;
	uuid: BotConversationMessageUuid;
	messages: Array<Message>;
};

type Ctx = {
	optimisticBotConversationMessages: Array<BotConversationMessage>;
	notebookId: NotebookId;
};

const mutationKey = queryKeyFactory.post["bot-conversation-message"].queryKey;

export function useAddBotConversationMessage() {
	const organizationId = useWithOrganizationId();
	const betterbrainUser = useGetUser();

	function setIsStreamingTo(
		requestBotConversationId: BotConversationId,
		nextValue: boolean,
	) {
		if (!isValidNumber(requestBotConversationId)) {
			throw new Error(
				`Invalid requestBotConversationId: ${requestBotConversationId}`,
			);
		}

		const botConversation = getBotConversation(requestBotConversationId);

		if (botConversation) {
			setBotConversation(requestBotConversationId, {
				...botConversation,
				is_streaming: nextValue,
			});
		}
	}

	return useMutation<
		CreateABotConversationMessageResponse,
		Error,
		CreateABotConversationMessageRequest,
		Ctx
	>({
		mutationKey,

		async mutationFn(args: CreateABotConversationMessageRequest) {
			const { botConversationId, ...body } = args;

			const path = `/bot-conversations/${botConversationId}/messages`;

			const res =
				await clientAPI_V1.post<CreateABotConversationMessageResponse>(
					path,
					body,
				);

			return res.data;
		},

		// Before sending the mutation:
		onMutate(variables) {
			const { notebookId } = generalCtx.getState();

			if (!isValidNumber(notebookId)) {
				throw new Error(`Invalid notebookId: ${notebookId}`);
			}

			const { botConversationId, messages } = variables;
			const now = new Date();
			const nowISO = now.toISOString() as ISODateString;
			const nowTime = now.getTime();

			// Create optimistic item:
			const optimisticBotConversationMessages = messages.map((msg) => {
				const isTextMessage = msg.type === MessageType.Text;

				if (isTextMessage) {
					const optimisticConversationMessage: BotConversationMessage = {
						message_status: BotConversationMessageStatus.InProgress,
						message_type: BotConversationMessageType.User_Message,
						id: Math.random() as BotConversationMessageId,
						sub_conversation_uuids: ["None"],
						show_as_intermediate_step: false,
						order_by_timestamp_ms: nowTime,
						parallel_conversation_id: null,
						visible_to_model: true,
						visible_to_user: true,
						updated_at: nowISO,
						created_at: nowISO,
						toggle_text: null,
						transient: false,
						thumbs_up: null,
						archived: false,
						uuid: msg.uuid,
						text: msg.text,
						sources: null,
						block: null,
						json: null,
						bot_conversation: {
							id: botConversationId,
						},
						sender: {
							sender_type: BotConversationMessageSenderType.User,
							sender_info: betterbrainUser,
						},
					};

					return optimisticConversationMessage;
				} else {
					const optimisticConversationMessage: BotConversationMessage = {
						message_type:
							BotConversationMessageType.Notebook_Block_User_Image_Message,
						block: { uuid: msg.uuid as unknown as NotebookBlockUuid },
						message_status: BotConversationMessageStatus.InProgress,
						id: Math.random() as BotConversationMessageId,
						sub_conversation_uuids: ["None"],
						show_as_intermediate_step: false,
						order_by_timestamp_ms: nowTime,
						parallel_conversation_id: null,
						visible_to_model: true,
						visible_to_user: true,
						updated_at: nowISO,
						created_at: nowISO,
						toggle_text: null,
						transient: false,
						thumbs_up: null,
						archived: false,
						uuid: msg.uuid,
						sources: null,
						text: null,
						json: null,
						bot_conversation: {
							id: botConversationId,
						},
						sender: {
							sender_type: BotConversationMessageSenderType.User,
							sender_info: betterbrainUser,
						},
					};

					return optimisticConversationMessage;
				}
			});

			// Add optimistic item to cache:
			setBotConversationMessageListPages(
				botConversationId,
				(cachedBotConversationMessagePages) => {
					const lastPage = cachedBotConversationMessagePages?.pages.at(-1);

					if (!lastPage) {
						return cachedBotConversationMessagePages;
					}

					// If cache exists, let's add the optimistic item to it:
					// The logic here is like this because it is not a simple array. It is made of pages, because that's what we receive from the backend.
					if (cachedBotConversationMessagePages) {
						const results = [
							...lastPage.results,
							...optimisticBotConversationMessages,
						];
						const newLastPage: typeof lastPage = {
							...lastPage,
							num_results: lastPage.num_results + 1,
							results,
						};

						const next: typeof cachedBotConversationMessagePages = {
							...cachedBotConversationMessagePages,
							pages: cachedBotConversationMessagePages.pages.with(
								-1,
								newLastPage,
							),
						};

						return next;
					} else {
						// In case there is currently no cache, let's create a new one with the same underline data layout:
						const next: NonNullable<BotConversationMessageListPageInfiniteResponse> =
							{
								pageParams: [],
								pages: [
									{
										results: [...optimisticBotConversationMessages],
										limit: 100 as PageLimit,
										offset: 0 as PageOffset,
										num_results: 1,
									},
								],
							};

						return next;
					}
				},
			);

			setIsStreamingTo(botConversationId, true);

			// Here you have to return the context that will be passed to the `onSuccess` and `onSettled` callbacks:
			return {
				optimisticBotConversationMessages,
				notebookId,
			};
		},

		onSuccess(updatesResponse, variables, context) {
			invariant(context, "Context is missing");

			applyNotebookResponseUpdates({
				organizationId,
				response: {
					bot_conversation_id: variables.botConversationId,
					updates: updatesResponse.updates,
					project_id: context.notebookId,
					timestamp: createISODate(),
				},
			});
		},

		onSettled(_data, _error, variables) {
			setIsStreamingTo(variables.botConversationId, false);
		},

		onError(error, variables, context) {
			console.error("Failed to send message!", {
				error,
				variables,
				context,
			});

			toast.error("Failed to send message!", {
				description: error.message,
			});

			if (!context) {
				return;
			}

			// Replace optimistic items from the cache: update to show they errored.
			setBotConversationMessageListPages(
				variables.botConversationId,
				(cachedBotConversationMessagePages) => {
					if (!(cachedBotConversationMessagePages && context)) {
						return cachedBotConversationMessagePages;
					}

					// We are assuming that the optimistic item is already in cache and in the firstPage:
					const lastPage = cachedBotConversationMessagePages.pages.at(-1);

					if (!lastPage) {
						console.error(
							"No lastPage! There is no optimistic item to remove!",
							{
								cachedBotConversationMessagePages,
								context,
							},
						);

						return cachedBotConversationMessagePages;
					}

					const newResults = [...lastPage.results];

					context.optimisticBotConversationMessages.forEach((msg) => {
						const optimisticConversationIndex = lastPage.results.findIndex(
							(prevMsg) => prevMsg.uuid === msg.uuid,
						);

						if (optimisticConversationIndex === -1) return;

						// Update to show it has an error:
						msg.message_status = BotConversationMessageStatus.Error;

						newResults.splice(optimisticConversationIndex, 1, msg);
					});

					const newFirstPage: typeof lastPage = {
						...lastPage,
						results: newResults,
					};

					const next: typeof cachedBotConversationMessagePages = {
						...cachedBotConversationMessagePages,
						pages: cachedBotConversationMessagePages.pages.with(
							-1,
							newFirstPage,
						),
					};

					return next;
				},
			);
		},
	});
}
