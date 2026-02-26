import { generalCtx } from "#/contexts/general/ctx";
import { useFetchNotebook } from "#/hooks/get/use-get-notebook";
import { isValidNumber } from "#/lib/utils";

const SELECT_NOTEBOOK_WITH_BOT_CONVERSATION = (
	<div className="flex items-center justify-center w-full h-full bg-notebook text-primary">
		Please select a notebook with a bot conversation.
	</div>
);

function TriggerSuspenseToHaveBotConversationIdFromDownloadedNotebook(
	props: React.PropsWithChildren<{ fallback?: React.ReactNode }>,
) {
	const notebook = useFetchNotebook(); // This is the call that triggers Suspense

	const botConversationIdFromNotebook = notebook.metadata.bot_conversation?.id;
	const isValidBotConversationId = isValidNumber(botConversationIdFromNotebook);

	if (isValidBotConversationId) {
		generalCtx.setState({
			botConversationId: botConversationIdFromNotebook,
			notebookId: notebook.metadata.id,
		});
	}

	return isValidBotConversationId
		? props.children
		: props.fallback !== undefined
			? props.fallback
			: SELECT_NOTEBOOK_WITH_BOT_CONVERSATION;
}

export function WithBotConversationId(
	props: React.PropsWithChildren<{ fallback: React.ReactNode }>,
) {
	const notebookMetadataBotConversationId = generalCtx.use.botConversationId();

	return isValidNumber(notebookMetadataBotConversationId) ? (
		props.children
	) : (
		<TriggerSuspenseToHaveBotConversationIdFromDownloadedNotebook {...props} />
	);
}
