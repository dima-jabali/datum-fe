import { ThumbsDown, ThumbsUp } from "lucide-react";
import { memo, useState } from "react";

import { removeSourceCitations } from "#/components/Markdown/pre-processors";
import { CHECK_ICON, CLIPBOARD_ICON, X_ICON } from "#/components/msg-icons";
import { useMarkGoodBadResponse } from "#/hooks/mutation/use-mark-good-bad-response";
import { handleCopyTextToClipboard } from "#/lib/utils";
import {
	BotConversationMessageStatus,
	type BotConversationMessage,
} from "#/types/chat";

type Props = {
	message: BotConversationMessage;
	text?: string;
};

async function handleCopyMarkdown(
	text: string | undefined,
	message: BotConversationMessage,
	setHasCopiedMarkdownSuccessfully: React.Dispatch<
		React.SetStateAction<boolean | undefined>
	>,
) {
	const markdownText = text ?? message.text ?? "";

	const tranformedText = removeSourceCitations(markdownText);

	await handleCopyTextToClipboard(
		tranformedText,
		setHasCopiedMarkdownSuccessfully,
	);
}

export const OptionsButtons = memo(function OptionsButtons({
	message,
	text,
}: Props) {
	const [hasCopiedMarkdownSuccessfully, setHasCopiedMarkdownSuccessfully] =
		useState<boolean>();

	if (message.message_status !== BotConversationMessageStatus.Complete) {
		return null;
	}

	return (
		<footer className="flex w-full items-center justify-start gap-1 text-primary mb-6">
			<button
				onClick={() =>
					handleCopyMarkdown(text, message, setHasCopiedMarkdownSuccessfully)
				}
				title="Copy markdown text to clipboard"
				className="rounded-md p-1 button-hover"
			>
				{hasCopiedMarkdownSuccessfully === true
					? CHECK_ICON
					: hasCopiedMarkdownSuccessfully === false
						? X_ICON
						: CLIPBOARD_ICON}
			</button>

			<Thumbs message={message} />
		</footer>
	);
});

function Thumbs({ message }: { message: BotConversationMessage }) {
	const markGoodBadResponse = useMarkGoodBadResponse();

	const isGoodResponse = message.thumbs_up === true;
	const isBadResponse = message.thumbs_up === false;

	function handleSetAsGoodResponseOrNull() {
		const {
			bot_conversation: { id: botConversationId },
			id: botConversationMessageId,
			thumbs_up,
		} = message;

		markGoodBadResponse.mutate({
			thumbs_up: thumbs_up === true ? null : true,
			botConversationMessageId,
			botConversationId,
			feedback_text: "",
		});
	}

	function handleSetAsBadResponseOrNull() {
		const {
			bot_conversation: { id: botConversationId },
			id: botConversationMessageId,
			thumbs_up,
		} = message;

		markGoodBadResponse.mutate({
			thumbs_up: thumbs_up === false ? null : false,
			botConversationMessageId,
			botConversationId,
			feedback_text: "",
		});
	}

	return (
		<>
			<button
				className="rounded-md p-1 button-hover"
				onClick={handleSetAsGoodResponseOrNull}
				title="Good response"
			>
				<ThumbsUp
					className="size-4 stroke-2 fill-none data-[is-active=true]:fill-positive data-[is-active=true]:stroke-positive data-[is-active=false]:stroke-primary"
					data-is-active={isGoodResponse}
				/>
			</button>

			<button
				className="rounded-md p-1 button-hover"
				onClick={handleSetAsBadResponseOrNull}
				title="Bad response"
			>
				<ThumbsDown
					className="size-4 stroke-2 fill-none data-[is-active=true]:fill-destructive data-[is-active=true]:stroke-destructive data-[is-active=false]:stroke-primary"
					data-is-active={isBadResponse}
				/>
			</button>
		</>
	);
}
