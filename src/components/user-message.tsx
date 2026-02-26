import { CheckCheck, Loader, UserRound } from "lucide-react";
import { memo, useState } from "react";

import { handleCopyTextToClipboard, messageDateFormatter } from "#/lib/utils";
import {
	BotConversationMessageStatus,
	type BotConversationMessage,
} from "#/types/chat";
import { Markdown } from "#/components/Markdown/markdown";
import { CHECK_ICON, CLIPBOARD_ICON, X_ICON } from "#/components/msg-icons";
import { ImgWithFallback } from "#/components/img-with-fallback";

type Props = {
	msg: BotConversationMessage;
};

const USER_IMG_FALLBACK = (
	<div className="size-8 rounded-full bg-green-700 p-1.5">
		<UserRound className="size-5 stroke-2 stroke-white" />
	</div>
);

export const UserMessage = memo(function UserMessage({ msg }: Props) {
	const [wasCopiedSuccessfully, setWasCopiedSuccessfully] = useState<boolean>();

	const userInfo = msg.sender.sender_info
		? `${msg.sender.sender_info.first_name} ${msg.sender.sender_info.last_name}\n${msg.sender.sender_info.email}`
		: undefined;
	const createdAt = messageDateFormatter.format(new Date(msg.created_at));

	const hasFailedToSendMessage =
		msg.message_status === BotConversationMessageStatus.Error;
	const isMessageSent =
		msg.message_status === BotConversationMessageStatus.Complete;
	const isSendingMessage = !isMessageSent && !hasFailedToSendMessage;

	return (
		<li
			className="chat-content"
			title="User message"
			data-user-message
			data-id={msg.id}
		>
			<section className="flex flex-row-reverse items-center gap-2">
				<ImgWithFallback
					src={msg.sender.sender_info?.image_url ?? undefined}
					className="size-8 object-cover rounded-full"
					alt={msg.sender.sender_info?.first_name}
					fallbackNode={USER_IMG_FALLBACK}
					title={userInfo}
				/>

				<div className="h-fit flex gap-2 items-center">
					<p className="text-xs text-muted" title={createdAt}>
						{createdAt}
					</p>

					<p className="text-sm font-bold text-muted" title={userInfo}>
						{msg.sender.sender_info?.first_name}
					</p>
				</div>
			</section>

			<section
				className="simple-scrollbar text-base text-right whitespace-pre-wrap font-inter font-features-inter user-message-markdown-custom-styles w-full max-w-full flex justify-end pr-10 mobile:pr-0 py-1"
				aria-label="Message text"
			>
				{msg.text ? <Markdown text={msg.text} alignTextToRight /> : null}
			</section>

			<footer className="flex w-full items-center justify-end gap-1 text-primary pr-10 mobile:pr-0 pt-1.5">
				<button
					className="rounded-md p-1 button-hover"
					title="Copy message to clipboard"
					onClick={async () => {
						await handleCopyTextToClipboard(
							msg.text ?? "",
							setWasCopiedSuccessfully,
						);
					}}
				>
					{wasCopiedSuccessfully === true
						? CHECK_ICON
						: wasCopiedSuccessfully === false
							? X_ICON
							: CLIPBOARD_ICON}
				</button>

				<span
					className="flex items-center justify-center p-1"
					title={
						isMessageSent
							? "Message sent"
							: hasFailedToSendMessage
								? "Failed to send message"
								: "Sending message…"
					}
				>
					{isSendingMessage ? (
						<Loader />
					) : (
						<CheckCheck
							className="size-4 stroke-primary data-[has-failed-to-send=true]:stroke-destructive data-[is-message-sent=true]:stroke-positive"
							data-has-failed-to-send={hasFailedToSendMessage}
							data-is-message-sent={isMessageSent}
						/>
					)}
				</span>
			</footer>
		</li>
	);
});
