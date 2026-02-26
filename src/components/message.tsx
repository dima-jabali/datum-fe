import {
	BotConversationMessageType,
	type BotConversationMessage,
} from "#/types/chat";
import { AIResponse } from "#/components/ai-response";
import { UserMessage } from "#/components/user-message";
import { NotebookBlockMessage } from "#/components/notebook-block-message";

export function Message({ msg }: { msg: BotConversationMessage }) {
	switch (msg.message_type) {
		case BotConversationMessageType.AI_Response:
			return <AIResponse msg={msg} key={msg.uuid} />;

		case BotConversationMessageType.User_Message:
			return <UserMessage msg={msg} key={msg.uuid} />;

		case BotConversationMessageType.Notebook_Block_Message:
			return <NotebookBlockMessage msg={msg} key={msg.uuid} />;

		default:
			return null;
	}
}
