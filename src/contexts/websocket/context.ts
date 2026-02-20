import { createContext, useContext } from "react";
import type { ActorRefFrom } from "xstate";

import type { websocketStateMachine } from "#/contexts/websocket/websocket-state-machine";

export type WebsocketContextType = {
	actorRef: ActorRefFrom<typeof websocketStateMachine>;
};

export const WebsocketContext = createContext<WebsocketContextType | null>(
	null,
);

export function useWebsocketStore() {
	const context = useContext(WebsocketContext);

	if (!context) {
		throw new Error(
			"useWebsocketStore must be used within a WebsocketProvider",
		);
	}

	return context;
}
