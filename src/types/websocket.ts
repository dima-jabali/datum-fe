import type { EmptyObject, Tagged } from "type-fest";

import type { FileId } from "#/types/file";
import type { ISODateString, StreamUuid, UUID } from "#/types/general";
import type { BotConversationId } from "./notebook";

export enum WebsocketAction {
	UnsubscribeBotConversation = "UNSUBSCRIBE_BOT_CONVERSATION",
	SubscribeBotConversation = "SUBSCRIBE_BOT_CONVERSATION",
	UnsubscribeProject = "UNSUBSCRIBE_PROJECT",
	StopStreamingGeneration = "STOP_STREAM",
	SubscribeProject = "SUBSCRIBE_PROJECT",
	CheckAuth = "CHECK_AUTH",
	Auth = "AUTH",
}

export enum WebsocketEvent {
	UnsubscribeBotConversationResponse = "UNSUBSCRIBE_BOT_CONVERSATION_RESPONSE",
	SubscribeBotConversationResponse = "SUBSCRIBE_BOT_CONVERSATION_RESPONSE",
	UnsubscribeProjectResponse = "UNSUBSCRIBE_PROJECT_RESPONSE",
	PatchBatchTableWSMessage = "PATCH_BATCH_TABLE_RESPONSE",
	SubscribeProjectResponse = "SUBSCRIBE_PROJECT_RESPONSE",
	PatchProjectResponse = "PATCH_PROJECT_RESPONSE",
	CheckAuthResponse = "CHECK_AUTH_RESPONSE",
	UpdateBotSource = "UPDATE_BOT_SOURCE",
	StatusMessage = "STATUS_MESSAGE",
	AuthResponse = "AUTH_RESPONSE",
}

export type AuthActionData = {
	api_key?: string;
	auth_token?: string;
	token?: string;
};

export type SubscribeConversationActionData = {
	bot_conversation_id: BotConversationId;
};

export type UnsubscribeConversationActionData = {
	bot_conversation_id: BotConversationId;
};

export type UnsubscribeFileActionData = {
	file_id: FileId;
};

export type SubscribeFileActionData = {
	file_id: FileId;
};

export type StopStreamingGenerationActionData = {
	stream_uuid: StreamUuid;
};

export type RequestId = Tagged<string, "RequestId">;

type WebSocketMessagePayload<
	TData,
	TType extends WebsocketAction | WebsocketEvent,
> = {
	message_payload: TData;
	message_type: TType;
};
type WebSocketMessageBase = {
	timestamp: ISODateString;
	request_id: RequestId;
	tab_id: UUID;
};
type WebSocketMessage<
	TData,
	TType extends WebsocketAction | WebsocketEvent,
> = WebSocketMessagePayload<TData, TType> & WebSocketMessageBase;
type WebSocketMessageFromPayload<TPayload extends Record<string, unknown>> =
	TPayload & WebSocketMessageBase;

export type WebSocketCheckAuthPayload = WebSocketMessagePayload<
	EmptyObject,
	WebsocketAction.CheckAuth
>;
export type WebSocketCheckAuthAction =
	WebSocketMessageFromPayload<WebSocketCheckAuthPayload>;

export type WebSocketAuthPayload = WebSocketMessagePayload<
	AuthActionData,
	WebsocketAction.Auth
>;
export type WebSocketAuthAction =
	WebSocketMessageFromPayload<WebSocketAuthPayload>;

export type WebSocketSubscribeProjectPayload = WebSocketMessagePayload<
	SubscribeNotebookActionData,
	WebsocketAction.SubscribeProject
>;
export type WebSocketSubscribeProjectAction =
	WebSocketMessageFromPayload<WebSocketSubscribeProjectPayload>;

export type WebSocketUnsubscribeProjectPayload = WebSocketMessagePayload<
	UnsubscribeNotebookActionData,
	WebsocketAction.UnsubscribeProject
>;
export type WebSocketUnsubscribeProjectAction =
	WebSocketMessageFromPayload<WebSocketUnsubscribeProjectPayload>;

export type WebSocketSubscribeConversationPayload = WebSocketMessagePayload<
	SubscribeConversationActionData,
	WebsocketAction.SubscribeBotConversation
>;
export type WebSocketSubscribeConversationAction =
	WebSocketMessageFromPayload<WebSocketSubscribeConversationPayload>;

export type WebSocketUnsubscribeConversationPayload = WebSocketMessagePayload<
	UnsubscribeConversationActionData,
	WebsocketAction.UnsubscribeBotConversation
>;
export type WebSocketUnsubscribeConversationAction =
	WebSocketMessageFromPayload<WebSocketUnsubscribeConversationPayload>;

export type WebSocketStopGenerationPayload = WebSocketMessagePayload<
	StopStreamingGenerationActionData,
	WebsocketAction.StopStreamingGeneration
>;
export type WebSocketStopStreamingGenerationAction =
	WebSocketMessageFromPayload<WebSocketStopGenerationPayload>;

export type WebSocketActionPayload =
	| WebSocketUnsubscribeConversationPayload
	| WebSocketSubscribeConversationPayload
	| WebSocketUnsubscribeProjectPayload
	| WebSocketSubscribeProjectPayload
	| WebSocketStopGenerationPayload
	| WebSocketCheckAuthPayload
	| WebSocketAuthPayload;
export type WebSocketActionData =
	| WebSocketUnsubscribeConversationAction
	| WebSocketStopStreamingGenerationAction
	| WebSocketSubscribeConversationAction
	| WebSocketUnsubscribeProjectAction
	| WebSocketSubscribeProjectAction
	| WebSocketCheckAuthAction
	| WebSocketAuthAction;

export type CheckAuthResponseData = {
	is_authenticated?: boolean;
	is_authorized?: boolean;
};
export type WebSocketCheckAuthResponse = WebSocketMessage<
	CheckAuthResponseData,
	WebsocketEvent.CheckAuthResponse
>;

export enum WebSocketAuthStatus {
	Success = "success",
}
export type AuthResponseData = {
	status: WebSocketAuthStatus;
	error: string | null;
};

export type WebSocketAuthResponse = WebSocketMessage<
	AuthResponseData,
	WebsocketEvent.AuthResponse
>;

type WebSocketStatusMessageResponse = WebSocketMessage<
	EmptyObject,
	WebsocketEvent.StatusMessage
>;

export type WebSocketPatchResponse = WebSocketMessage<
	PatchProjectResponse,
	WebsocketEvent.PatchProjectResponse
>;

export type WebSocketSubscribeResponse = WebSocketMessage<
	{ status: WebSocketAuthStatus; error: string | null },
	WebsocketEvent.SubscribeProjectResponse
>;
export type WebSocketUnsubscribeResponse = WebSocketMessage<
	{ status: WebSocketAuthStatus; error: string | null },
	WebsocketEvent.UnsubscribeProjectResponse
>;

export type WebSocketSubscribeConversationResponse = WebSocketMessage<
	{ status: WebSocketAuthStatus; error: string | null },
	WebsocketEvent.SubscribeBotConversationResponse
>;
export type WebSocketUnsubscribeConversationResponse = WebSocketMessage<
	{ status: WebSocketAuthStatus; error: string | null },
	WebsocketEvent.UnsubscribeBotConversationResponse
>;

export type WebSocketEventData =
	| WebSocketUnsubscribeConversationResponse
	| WebSocketSubscribeConversationResponse
	| WebSocketStatusMessageResponse
	| WebSocketUnsubscribeResponse
	| WebSocketCheckAuthResponse
	| WebSocketSubscribeResponse
	| WebSocketPatchResponse
	| WebSocketAuthResponse;
