import { useMachine } from "@xstate/react";
import { useWebSocket } from "partysocket/react";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { generalCtx } from "#/contexts/general/ctx";
import { WebsocketContext } from "#/contexts/websocket/context";
import { websocketStateMachine } from "#/contexts/websocket/websocket-state-machine";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import {
	isDev,
	isValidNumber,
	OPTIMISTIC_NEW_NOTEBOOK_ID,
	stringifyUnknown,
} from "#/lib/utils";
import {
	WebSocketAuthStatus,
	WebsocketEvent,
	type WebSocketEventData,
} from "#/types/websocket";

const WEBSOCKET_URL = import.meta.env.VITE_PUBLIC_WEBSOCKET_BACKEND_URL;

if (!WEBSOCKET_URL) {
	throw new Error(
		"import.meta.env.VITE_PUBLIC_WEBSOCKET_BACKEND_URL is not defined",
	);
}

function WebsocketProviderInner({ children }: PropsWithChildren) {
	const generalStoreBotConversationId = generalCtx.use.botConversationId();
	const generalStoreNotebookId = generalCtx.use.notebookId();
	const organizationId = generalCtx.use.organizationId();

	const [snapshot, send, actorRef] = useMachine(websocketStateMachine);

	useEffect(() => {
		const isOptimisticNotebook =
			generalStoreNotebookId === OPTIMISTIC_NEW_NOTEBOOK_ID;

		console.log({
			organizationId: generalCtx.getState().organizationId,
			generalStoreBotConversationId,
			generalStoreNotebookId,
			isOptimisticNotebook,
		});

		if (isOptimisticNotebook) return;

		if (
			isValidNumber(generalStoreBotConversationId) &&
			isValidNumber(generalStoreNotebookId)
		) {
			send({
				type: "subscribe-to-notebook-and-bot-conversation",
				botConversationId: generalStoreBotConversationId,
				notebookId: generalStoreNotebookId,
			});
		}
	}, [generalStoreBotConversationId, generalStoreNotebookId, send]);

	useEffect(() => {
		const unsub = actorRef.subscribe({
			error(err) {
				console.error("Websocket state machine error:", err);
			},
		});

		return () => {
			unsub.unsubscribe();
		};
	}, [snapshot, actorRef]);

	const websocket = useWebSocket(WEBSOCKET_URL!, undefined, {
		debug: isDev,

		onOpen() {
			console.log("Websocket connection opened");

			send({ type: "set=websocket", websocket });
		},

		onClose(event) {
			console.error("Websocket closed. Event:", stringifyUnknown(event, 0));

			send({ type: "go-to=closed" });
		},

		onError(event) {
			console.error("WebSocket error. Event:", stringifyUnknown(event, 0));
		},

		onMessage(event) {
			try {
				const data: WebSocketEventData = JSON.parse(event.data);

				switch (data.message_type) {
					case WebsocketEvent.CheckAuthResponse: {
						if (
							data.message_payload.is_authenticated ||
							data.message_payload.is_authorized
						) {
							if (
								!isValidNumber(generalStoreBotConversationId) &&
								!isValidNumber(generalStoreNotebookId)
							) {
								send({
									type: "go-to=idle",
								});

								break;
							}

							send({
								type: "go-to=subscribing-to-notebook-and-bot-conversation",
							});

							break;
						}

						send({ type: "go-to=authenticating" });

						break;
					}

					case WebsocketEvent.AuthResponse: {
						const isWebsocketAuthenticated =
							data.message_payload.status === WebSocketAuthStatus.Success;

						if (isWebsocketAuthenticated) {
							if (
								!isValidNumber(generalStoreBotConversationId) &&
								!isValidNumber(generalStoreNotebookId)
							) {
								send({
									type: "go-to=idle",
								});

								break;
							}

							send({
								type: "go-to=subscribing-to-notebook-and-bot-conversation",
							});
						} else {
							console.log(
								"%cWebsocket authentication failed!",
								"background-color: red; padding: 2px 10px; color: white; font-weight: 700;",
								event,
							);

							send({ type: "go-to=authenticating" });
						}

						break;
					}

					case WebsocketEvent.PatchProjectResponse: {
						if (
							isValidNumber(data.message_payload.bot_conversation_id) &&
							isValidNumber(data.message_payload.project_id) &&
							isValidNumber(organizationId)
						) {
							applyNotebookResponseUpdates({
								organizationId,
								response: {
									bot_conversation_id: data.message_payload.bot_conversation_id,
									project_id: data.message_payload.project_id,
									timestamp: data.message_payload.timestamp,
									updates: data.message_payload.updates,
								},
							});
						}

						break;
					}

					case WebsocketEvent.SubscribeProjectResponse: {
						const hasSubscribed =
							data.message_payload.status === WebSocketAuthStatus.Success;

						const notebookId = generalCtx.getState().notebookId;

						if (!isValidNumber(notebookId)) {
							console.error("Notebook ID is not valid", { notebookId });

							break;
						}

						if (hasSubscribed) {
							console.log(
								`%cSubscribed to project of id \`${notebookId}\`!`,
								"background-color: green; color: white; padding: 2px;",
							);

							send({ type: "set=subscribed-to-notebook", notebookId });
						} else {
							toast.error(
								`Failed to connect to WebSocket for project with ID: \`${notebookId}\`!`,
								{
									description: "Please refresh the page.",
								},
							);

							console.log(
								`%cFailed to subscribe to project of id \`${notebookId}\`!`,
								"background-color: red; color: white; padding: 2px;",
							);
						}

						break;
					}

					case WebsocketEvent.SubscribeBotConversationResponse: {
						const hasSubscribed =
							data.message_payload.status === WebSocketAuthStatus.Success;

						const botConversationId = generalCtx.getState().botConversationId;

						if (!isValidNumber(botConversationId)) {
							console.error("botConversationId is not valid", {
								botConversationId,
							});

							break;
						}

						if (hasSubscribed) {
							console.log(
								`%cSubscribed to bot conversation of id \`${botConversationId}\`!`,
								"background-color: green; color: white; padding: 2px;",
							);

							send({
								type: "set=subscribed-to-bot-conversation",
								botConversationId,
							});
						} else {
							toast.error("Failed to connect to WebSocket!", {
								description: "Please refresh the page.",
							});

							console.log(
								`%cFailed to subscribe to bot conversation of id \`${botConversationId}\`!`,
								"background-color: red; color: white; padding: 2px;",
							);
						}

						break;
					}

					case WebsocketEvent.UnsubscribeProjectResponse: {
						const hasUnsubscribed =
							data.message_payload.status === WebSocketAuthStatus.Success;

						if (hasUnsubscribed) {
							console.log(
								`%cUnsubscribed from some project!`,
								"background-color: blue; color: white; padding: 2px;",
							);
						} else {
							console.log(
								`%cFailed to unsubscribe from some project!`,
								"background-color: red; color: white; padding: 2px;",
							);
						}

						break;
					}

					case WebsocketEvent.UnsubscribeBotConversationResponse: {
						const hasUnsubscribed =
							data.message_payload.status === WebSocketAuthStatus.Success;

						if (hasUnsubscribed) {
							console.log(
								`%cUnsubscribed from some bot conversation!`,
								"background-color: blue; color: white; padding: 2px;",
							);
						} else {
							console.log(
								`%cFailed to unsubscribe from some bot conversation!`,
								"background-color: red; color: white; padding: 2px;",
							);
						}

						break;
					}

					default: {
						console.log(
							"%cUnknown message type in websocket onMessage:",
							"background-color: red; padding: 2px 10px; color: white; font-weight: 700;",
							{ data, event },
						);
						break;
					}
				}
			} catch (error) {
				console.error("Error in websocket onMessage:", { error, event });
			}
		},
	});

	const providerValue = useMemo(
		() => ({
			actorRef,
		}),
		[actorRef],
	);

	return (
		<WebsocketContext.Provider value={providerValue}>
			{children}
		</WebsocketContext.Provider>
	);
}

export function WebsocketProvider({ children }: PropsWithChildren) {
	const organizationId = generalCtx.use.organizationId();

	return (
		<WebsocketProviderInner key={organizationId}>
			{children}
		</WebsocketProviderInner>
	);
}
