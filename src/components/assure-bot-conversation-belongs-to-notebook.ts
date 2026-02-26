import { memo } from "react";

import { generalCtx } from "#/contexts/general/ctx";
import { useDownloadedNotebookBotConversationId } from "#/hooks/get/use-get-notebook";
import { useGetNotebookListPage } from "#/hooks/get/use-get-notebook-list-page";
import { isValidNumber } from "#/lib/utils";

export const AssureBotConversationBelongsToNotebook = memo(
	function AssureBotConversationBelongsToNotebook({
		children,
	}: React.PropsWithChildren) {
		const botConversationFromDownloadedNotebook =
			useDownloadedNotebookBotConversationId();
		const botConversationIdFromGeneralStore =
			generalCtx.use.botConversationId();
		const notebookList = useGetNotebookListPage();

		if (
			!isValidNumber(botConversationIdFromGeneralStore) ||
			!isValidNumber(botConversationFromDownloadedNotebook)
		) {
			console.log("Notebook or current bot conversation is not defined.", {
				botConversationFromDownloadedNotebook,
				botConversationIdFromGeneralStore,
			});

			return null;
		}

		if (
			botConversationFromDownloadedNotebook !==
			botConversationIdFromGeneralStore
		) {
			let msg = "Bot conversation does not belong to the current notebook.";

			const notebookBotConversationBelongsTo = notebookList.data.pages
				.flatMap((page) => page.results)
				.find(
					(notebook) =>
						notebook.bot_conversation?.id ===
						botConversationFromDownloadedNotebook,
				);

			if (notebookBotConversationBelongsTo) {
				msg += `\nThis bot conversation belongs to notebook "${notebookBotConversationBelongsTo.title} (${notebookBotConversationBelongsTo.id})", to which you have access to.\nChange notebook in the top right corner to access it.`;
			}

			console.log({
				botConversationFromDownloadedNotebook,
				botConversationIdFromGeneralStore,
			});

			throw new Error(msg);
		}

		return children;
	},
);
