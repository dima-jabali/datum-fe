import { memo } from "react";

import { Markdown } from "#/components/Markdown/markdown";
import { BOT_IMG } from "#/components/msg-icons";
import { OptionsButtons } from "#/components/options-button";
import { generalCtx } from "#/contexts/general/ctx";
import { messageDateFormatter } from "#/lib/utils";
import type { BotConversationMessage } from "#/types/chat";

type Props = {
	msg: BotConversationMessage;
};

export const AIResponse = memo(function AIResponse({ msg }: Props) {
	const botName = generalCtx.use.chatBotAgentName();

	const userInfo = msg.sender.sender_info
		? `${msg.sender.sender_info.first_name} ${msg.sender.sender_info.last_name}\n${msg.sender.sender_info.email}`
		: undefined;
	const createdAt = messageDateFormatter.format(new Date(msg.created_at));

	return (
		<li
			className="chat-content"
			title="AI Response"
			data-ai-response
			data-id={msg.id}
		>
			<section className="flex items-center gap-2">
				{BOT_IMG}

				<div className="h-fit flex gap-2 items-center">
					<p className="text-sm text-muted font-bold" title={userInfo}>
						{botName}
					</p>

					<p className="text-xs text-muted" title={createdAt}>
						{createdAt}
					</p>
				</div>
			</section>

			<div className="pl-10 mobile:pl-0 text-base">
				{msg.text ? <Markdown text={msg.text} /> : null}
			</div>

			<div className="pl-10 mobile:pl-0 pt-1.5">
				<OptionsButtons message={msg} />
			</div>
		</li>
	);
});
