import { AssureBotConversationBelongsToNotebook } from "#/components/assure-bot-conversation-belongs-to-notebook";
import { AssureNotebookBelongsToOrg } from "#/components/assure-notebook-belongs-to-org";
import { WithBotConversationId } from "#/components/with-bot-conversation-id";
import { WithBotConversationMessageList } from "#/components/with-bot-conversation-message-list";
import { WithNotebook } from "#/components/with-notebook";
import { WithNotebookIdAndList } from "#/components/with-notebook-id-and-list";
import { WithSettings } from "#/components/with-settings";
import { WithOrganizationIdAndList } from "#/components/with-organization-id-and-list";

export function WithChatData({
	children,
	fallback,
}: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
	return (
		<WithOrganizationIdAndList>
			<WithNotebookIdAndList>
				<WithNotebook>
					<WithSettings>
						<WithBotConversationId fallback={fallback}>
							<AssureNotebookBelongsToOrg>
								<WithBotConversationMessageList>
									<AssureBotConversationBelongsToNotebook>
										{children}
									</AssureBotConversationBelongsToNotebook>
								</WithBotConversationMessageList>
							</AssureNotebookBelongsToOrg>
						</WithBotConversationId>
					</WithSettings>
				</WithNotebook>
			</WithNotebookIdAndList>
		</WithOrganizationIdAndList>
	);
}
