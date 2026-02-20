import { Loader } from "lucide-react";
import { memo, useMemo } from "react";

import { generalCtx, useWithOrganizationId } from "#/contexts/general/ctx";
import { useRerenderTreeStore } from "#/contexts/use-rerender-tree";
import { useGetNotebookListPage } from "#/hooks/get/use-get-notebook-list-page";
import { handleGoToChat, handlePrefetchChat } from "#/lib/handle-go-to-chat";
import { isMobile } from "#/lib/utils";
import { FakeAIStream } from "#/components/fake-ai-stream";
import { useSetNotebookToFirst } from "#/hooks/use-set-notebook-to-first";

export const NotebookList = memo(function NotebookList() {
	const organizationId = useWithOrganizationId();
	const rerenderTree = useRerenderTreeStore().use.rerenderTree();
	const getNotebookListPageQuery = useGetNotebookListPage();
	const notebookId = generalCtx.use.notebookId();

	useSetNotebookToFirst();

	const notebookMetadataList = useMemo(
		() => getNotebookListPageQuery.data.pages.flatMap((page) => page.results),
		[getNotebookListPageQuery.data],
	);

	return (
		<ul className="flex flex-col aside-closed:hidden max-h-full simple-scrollbar overflow-x-hidden">
			{notebookMetadataList.map((notebookMetadata, index) => {
				const botConversationId = notebookMetadata.bot_conversation?.id ?? null;
				const id = notebookMetadata.id;

				if (index === 0) {
					handlePrefetchChat(id, botConversationId, organizationId);
				}

				const isActive = id === notebookId;

				return (
					<li
						className="cursor-pointer grid grid-cols-[1fr_calc(var(--spacing)*9)] w-full max-w-full button-hover rounded-lg items-center text-primary text-xs data-[is-active=true]:bg-button-hover select-none overflow-hidden h-9 flex-none"
						title={`${notebookMetadata.title} (${id})`}
						data-is-active={isActive}
						key={id}
						ref={(ref) => {
							if (isActive) {
								ref?.scrollIntoView({
									block: "center",
								});
							}
						}}
					>
						<button
							onClick={() => {
								handleGoToChat(id, botConversationId);

								rerenderTree();
							}}
							onPointerDown={() => {
								if (!isMobile()) {
									handlePrefetchChat(id, botConversationId, organizationId);
								}
							}}
							className="w-full overflow-hidden h-full p-2 flex items-center truncate"
							type="button"
						>
							<FakeAIStream
								className="block truncate min-w-0"
								fullText={notebookMetadata.title}
								key={notebookMetadata.uuid}
							/>

							<span className="ml-auto text-xs text-muted-foreground sr-only">
								{notebookMetadata.id}
							</span>
						</button>
					</li>
				);
			})}

			{notebookMetadataList.length === 0 ? (
				<div className="flex flex-col gap-3 text-xs items-center justify-center w-full h-full text-muted">
					<span>No projects on this organization!</span>
				</div>
			) : (
				<li className="flex items-center justify-center w-full p-2">
					<button
						className="disabled:opacity-50 p-2 text-xs not-disabled:link not-disabled:hover:underline flex gap-2 items-center"
						onClick={() => getNotebookListPageQuery.fetchNextPage()}
						disabled={
							!getNotebookListPageQuery.hasNextPage ||
							getNotebookListPageQuery.isFetchingNextPage
						}
						type="button"
					>
						{getNotebookListPageQuery.isFetchingNextPage ? (
							<>
								<Loader />

								<span>Loading more…</span>
							</>
						) : getNotebookListPageQuery.hasNextPage ? (
							"Load more"
						) : (
							"Nothing more to load"
						)}
					</button>
				</li>
			)}
		</ul>
	);
});
