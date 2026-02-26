import { Plus } from "lucide-react";

import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";
import { Loader } from "#/components/loader";
import { NotebookList } from "#/components/notebook-list";
import { Separator } from "#/components/ui/separator";
import { WithOrganizationIdAndList } from "#/components/with-organization-id-and-list";
import { generalCtx, useWithOrganizationId } from "#/contexts/general/ctx";
import {
	useCreateNotebook,
	type NewCreateProjectRequestBody,
} from "#/hooks/mutation/use-create-notebook";
import { useIsCreatingNotebook } from "#/hooks/mutation/use-is-creating-notebook";
import { handleGoToChat } from "#/lib/handle-go-to-chat";
import { createNotebookUuid, OPTIMISTIC_NEW_NOTEBOOK_ID } from "#/lib/utils";
import { type BotConversationId } from "#/types/notebook";

export function NotebookListWrapper() {
	const isCreatingNotebook = useIsCreatingNotebook();
	const organizationId = useWithOrganizationId();
	const notebookId = generalCtx.use.notebookId();
	const createNotebook = useCreateNotebook();

	const key = `${organizationId}-${notebookId}`;

	async function handleCreateChat() {
		if (isCreatingNotebook) return;

		const newNotebookData: NewCreateProjectRequestBody = {
			organizationId,
			blocks: [],
			metadata: {
				uuid: createNotebookUuid(),
				title: "New chat",
			},
		};

		createNotebook.mutate(newNotebookData);

		handleGoToChat(
			OPTIMISTIC_NEW_NOTEBOOK_ID,
			OPTIMISTIC_NEW_NOTEBOOK_ID as unknown as BotConversationId,
		);
	}

	return (
		<>
			<button
				className="flex gap-2 p-2 pl-3.5 items-center justify-between button-hover text-sm rounded-lg text-muted-foreground w-full"
				onClick={handleCreateChat}
				title="Create a new chat"
				type="button"
			>
				<div className="flex items-center gap-2">
					{isCreatingNotebook ? (
						<Loader className="size-5" />
					) : (
						<Plus className="size-5 stroke-1" />
					)}

					<span className="aside-closed:hidden">New Chat</span>
				</div>
			</button>

			<div className="flex flex-col h-full max-h-full w-full overflow-hidden aside-closed:invisible mt-1 gap-1">
				<Separator />

				<span className="text-sm font-bold text-primary mx-3 my-2 aside-closed:hidden">
					Chats
				</span>

				<WithOrganizationIdAndList key={key}>
					<DefaultSuspenseAndErrorBoundary
						fallbackFor="notebook list wrapper"
						failedText="Failed to load chats"
						fallbackTextClassName="text-xs"
						fallbackText="Loading chats…"
					>
						<NotebookList />
					</DefaultSuspenseAndErrorBoundary>
				</WithOrganizationIdAndList>
			</div>
		</>
	);
}
