import { useEffect } from "react";

import { generalCtx } from "#/contexts/general/ctx";
import { useIsStreaming } from "#/hooks/get/use-get-bot-conversation";
import { useAllChatSourcesMainValues } from "#/hooks/get/use-get-bot-conversation-message-list-page";

export function SetNormalizedSourcesOnGeneralCtx() {
	const isStreaming = useIsStreaming();

	useEffect(() => {
		return () => {
			console.log("Clearing sourcesMainValues");

			generalCtx.setState({ sourcesMainValues: new Map() });
		};
	}, []);

	return isStreaming ? null : <WhenNotStreaming />;
}

function WhenNotStreaming() {
	const sourcesMainValues = useAllChatSourcesMainValues();

	useEffect(() => {
		generalCtx.setState({ sourcesMainValues });
	}, [sourcesMainValues]);

	generalCtx.setState({ sourcesMainValues });

	return null;
}
