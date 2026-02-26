import { generalCtx } from "#/contexts/general/ctx";
import {
	useGetBotConversationMessageListPage,
	useHasAnyMessage,
} from "#/hooks/get/use-get-bot-conversation-message-list-page";
import { AutoScrollIfOnBottom } from "#/components/auto-scroll-if-on-bottom";
import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";
import { Message } from "#/components/message";
import { EmptyChat } from "#/components/empty-chat";
import { MessageInput } from "#/components/message-input";
import { ScrollToBottomButton } from "#/components/scroll-to-bottom-button";
import { WithChatData } from "#/components/with-chat-data";
import { PlanMessage } from "#/components/plan-message/plan-message";
import { SourceCitationContextProvider } from "#/contexts/source-citation/provider";

export function ChatContent() {
	return (
		<DefaultSuspenseAndErrorBoundary
			failedText="Error on chat content!"
			fallbackFor="chat-content"
		>
			<SourceCitationContextProvider>
				<WithChatData>
					<Chat />
				</WithChatData>
			</SourceCitationContextProvider>
		</DefaultSuspenseAndErrorBoundary>
	);
}

function Chat() {
	const hasAnyMessage = useHasAnyMessage();

	return (
		<div className="@container/chat flex h-full flex-col items-center justify-between overflow-hidden">
			{hasAnyMessage ? (
				<ol
					className="chat-grid simple-scrollbar w-full"
					ref={(ref) => {
						generalCtx.setState({ chatListRef: ref });
					}}
				>
					<div className="chat-content min-h-10"></div>

					<Messages />

					<AutoScrollIfOnBottom />
				</ol>
			) : (
				<EmptyChat />
			)}

			<PlanMessage />

			<div className="w-full relative flex items-center justify-center py-2 flex-none">
				{hasAnyMessage ? <ScrollToBottomButton /> : null}

				<div className="chat-grid w-full not-mobile:mr-(--simple-scrollbar-width)">
					<DefaultSuspenseAndErrorBoundary
						failedText="Error on message input!"
						fallbackFor="message-input-wrapper"
					>
						<MessageInput />
					</DefaultSuspenseAndErrorBoundary>
				</div>
			</div>
		</div>
	);
}

function Messages() {
	const msgs = useGetBotConversationMessageListPage().data.pages;

	return msgs.flatMap(({ results }) =>
		results.map((msg) => <Message key={msg.uuid} msg={msg} />),
	);
}
