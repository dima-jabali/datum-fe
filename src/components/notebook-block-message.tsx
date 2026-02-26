import { memo, type PropsWithChildren } from "react";

import { BOT_IMG } from "#/components/msg-icons";
import { generalCtx } from "#/contexts/general/ctx";
import { useNotebookBlock } from "#/hooks/get/use-get-notebook";
import { isDev, messageDateFormatter } from "#/lib/utils";
import {
	BotConversationMessageSenderType,
	type BotConversationMessage,
} from "#/types/chat";
import {
	BlockType,
	type NotebookBlock,
	type NotebookBlockUuid,
} from "#/types/notebook";

type Props = {
	msg: BotConversationMessage;
};

export const NotebookBlockMessage = memo(function NotebookBlockMessage({
	msg,
}: Props) {
	const notebookBlockUuid = msg.block?.uuid;

	if (!notebookBlockUuid) {
		if (isDev) {
			console.log("Notebook block uuid not present", { msg });
		}

		return null;
	}

	return (
		<Root
			notebookBlockUuid={notebookBlockUuid}
			msg={msg}
			key={notebookBlockUuid}
		/>
	);
});

function Root({
	notebookBlockUuid,
	msg,
}: Props & { notebookBlockUuid: NotebookBlockUuid }) {
	const { notebookBlock, render } = useNotebookBlock(notebookBlockUuid);

	if (!notebookBlock || !render) {
		if (isDev) {
			console.log("Notebook block not found", {
				notebookBlockUuid,
				notebookBlock,
				render,
				msg,
			});
		}

		return null;
	}

	if (notebookBlock.type === BlockType.Text) {
		const text = notebookBlock.custom_block_info?.plain_text ?? "";

		if (!text) return null;
	}

	return (
		<Content msg={msg} notebookBlock={notebookBlock} key={notebookBlockUuid}>
			{render}
		</Content>
	);
}

function Content({
	notebookBlock,
	children,
	msg,
}: PropsWithChildren<Props & { notebookBlock: NotebookBlock }>) {
	const botName = generalCtx.use.chatBotAgentName();

	const userInfo = msg.sender.sender_info
		? `${msg.sender.sender_info.first_name} ${msg.sender.sender_info.last_name}\n${msg.sender.sender_info.email}`
		: undefined;
	const createdAt = messageDateFormatter.format(new Date(msg.created_at));

	const isBot =
		msg.sender.sender_type !== BotConversationMessageSenderType.User;

	return (
		<div
			data-block-type={notebookBlock.type}
			title="Notebook block message"
			data-notebook-block-message
			className="chat-content"
			data-id={msg.id}
		>
			<section
				className="flex flex-row items-center gap-2 data-[is-bot=false]:flex-row-reverse text-muted"
				data-is-bot={isBot}
			>
				{isBot ? (
					BOT_IMG
				) : (
					<img
						alt={msg.sender.sender_info?.first_name ?? ""}
						src={msg.sender.sender_info?.image_url ?? ""}
						className="size-8 object-cover rounded-full"
						title={userInfo}
					/>
				)}

				<p className="text-sm font-bold" title={userInfo}>
					{isBot ? botName : msg.sender.sender_info?.first_name}
				</p>

				<p className="text-xs " title={createdAt}>
					{createdAt}
				</p>
			</section>

			<div className="flex w-full py-2 [&>div]:w-full">{children}</div>
		</div>
	);
}
