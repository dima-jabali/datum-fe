import { createQueryKeyStore } from "@lukemorales/query-key-factory";

import { api } from "#/api/api";
import type { UserId } from "#/types/user";
import type { OrganizationId } from "#/types/organization";
import type {
	BotConversationId,
	NotebookBlockUuid,
	NotebookId,
	PdfId,
} from "#/types/notebook";
import type { FileId } from "#/types/file";
import type { GetBotConversationMessagesPageRequest } from "#/hooks/get/use-get-bot-conversation-message-list-page";
import type { FetchNotebookListPageParams } from "#/hooks/get/use-get-notebook-list-page";

export const queryKeyFactory = createQueryKeyStore({
	get: {
		"file-by-presigned-url": null,
		"search-user-by-email": null,
		"all-conversations": null,
		"aws-base64-file": null,
		"aws-csv-file": null,
		"aws-image": null,

		"org-member": (organizationId: OrganizationId, userId: UserId) => ({
			queryFn: () => api.get["org-member"](organizationId, userId),
			queryKey: [organizationId, userId],
		}),

		"bot-plan": (
			botConversationId: BotConversationId,
			organizationId: OrganizationId,
			notebookId: NotebookId,
		) => ({
			queryFn: () =>
				api.get["bot-plan"](botConversationId, organizationId, notebookId),
			queryKey: [botConversationId, organizationId, notebookId],
		}),

		"organization-users": (organizationId: OrganizationId) => ({
			queryKey: [organizationId],
		}),

		"all-organizations": {
			queryFn: () => api.get["all-organizations"](),
			queryKey: null,
		},

		"all-database-connections": (organizationId: OrganizationId) => ({
			queryFn: () => api.get["all-database-connections"](organizationId),
			queryKey: [organizationId],
		}),

		"bot-conversation-message-list-page": (
			botConversationId: BotConversationId,
		) => ({
			queryFn: ({
				pageParam,
			}: {
				pageParam: GetBotConversationMessagesPageRequest;
			}) => api.get["bot-conversation-message-list-page"](pageParam),
			queryKey: [botConversationId],
		}),

		"notebook-by-id": (notebookId: NotebookId) => ({
			queryFn: () => api.get["notebook-by-id"](notebookId),
			queryKey: [notebookId],
		}),

		"notebook-list-page": (organizationId: OrganizationId) => ({
			queryFn: ({ pageParam }: { pageParam: FetchNotebookListPageParams }) =>
				api.get["notebook-list-page"](pageParam, organizationId),
			queryKey: [organizationId],
		}),

		"bot-conversation": (botConversationId: BotConversationId) => ({
			queryFn: () => api.get["bot-conversation"](botConversationId),
			queryKey: [botConversationId],
		}),

		user: {
			queryFn: () => api.get["user"](),
			queryKey: null,
		},

		settings: (
			organizationId: OrganizationId,
			notebookId: NotebookId | undefined,
		) => ({
			queryFn: () => api.get["settings"](organizationId, notebookId),
			queryKey: [organizationId, notebookId],
		}),

		"url-preview": (url: string) => ({
			queryKey: [url],
		}),

		"pdf-file-by-id": (pdfFileId: FileId | PdfId | undefined) => ({
			queryFn: () => api.get["pdf-file-by-id"](pdfFileId),
			queryKey: [pdfFileId],
		}),
	},

	post: {
		"upload-file-as-base64-to-aws": null,
		"ask-to-generate-sql-code": null,
		"bot-conversation-message": null,
		"mark-good-bad-response": null,
		"upload-and-index-files": null,
		"invite-user-to-org": null,
		"upload-file-to-aws": null,
		"approve-bot-plan": null,
		"send-chat-files": null,
		"edit-bot-plan": null,
		organization: null,
		notebook: null,

		"update-result-variable": (blockUuid: NotebookBlockUuid) => ({
			queryKey: [blockUuid],
		}),

		"block-request": {
			queryKey: ["action" as const],
			contextQueries: {
				"run-csv": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"upload-csv": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"run-sql": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"run-table-block": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"fix-python": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"fix-sql": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"upload-pdf": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"run-python": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"index-pdf": (blockUuid: NotebookBlockUuid) => ({
					queryKey: [blockUuid],
				}),
				"paginate-dataframe": null,
				"download-csv": null,
				"download-sql": null,
			},
		},
	},

	put: {
		"update-organization": null,
		"update-org-user": null,
		"add-user-to-org": null,
		notebook: null,
		settings: null,
	},

	patch: {
		"notebook-blocks": null,
	},

	delete: {
		"user-from-org": null,
		"bot-plan": null,
	},
});
