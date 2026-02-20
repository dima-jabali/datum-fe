import { useQuery, useQueryClient } from "@tanstack/react-query";

import { generalCtx, useWithOrganizationId } from "#/contexts/general/ctx";
import {
	useGetNotebookListPage,
	useHasNotebooksInList,
	type FetchNotebookListPageParams,
	type FetchNotebookListPageResponse,
} from "#/hooks/get/use-get-notebook-list-page";
import { isValidNumber } from "#/lib/utils";
import type { PageLimit, PageOffset } from "#/types/general";
import { queryKeyFactory } from "#/hooks/query-key-factory";

type HasSetNotebookToFirst = boolean;

export function useSetNotebookToFirst() {
	const notebookMetadataList = useGetNotebookListPage().data;
	const organizationId = useWithOrganizationId();
	const notebookId = generalCtx.use.notebookId();
	const hasNotebooks = useHasNotebooksInList();
	const queryClient = useQueryClient();

	const hasNotebookSelected = isValidNumber(notebookId);

	return useQuery({
		enabled:
			!hasNotebookSelected && hasNotebooks && isValidNumber(organizationId),
		queryKey: ["set-notebook-to-first", organizationId],
		refetchOnMount: true,
		throwOnError: false,
		staleTime: 0, // Important
		retry: true,
		gcTime: 0, // Important
		queryFn: async (): Promise<HasSetNotebookToFirst> => {
			let firstNotebookMetadata = notebookMetadataList.pages[0]?.results[0];

			if (!firstNotebookMetadata) {
				throw new Error("No first notebook!");
			}

			if (!isValidNumber(firstNotebookMetadata.id)) {
				console.log(
					"No first notebook id! Seems that this notebook is an optimistic one",
					{
						firstNotebookMetadataId: firstNotebookMetadata.id,
						firstNotebookMetadata,
					},
				);

				const initialPageParam: FetchNotebookListPageParams = {
					offset: 0 as PageOffset,
					limit: 10 as PageLimit,
				};

				const queryOptions =
					queryKeyFactory.get["notebook-list-page"](organizationId);

				const newNotebookList: FetchNotebookListPageResponse =
					await queryClient.fetchQuery({
						...queryOptions,
						// @ts-expect-error => This is fine
						initialPageParam,
					});

				firstNotebookMetadata = newNotebookList.results[0];
			}

			if (!firstNotebookMetadata) {
				throw new Error("No first notebook even after refetch!");
			}

			if (!isValidNumber(firstNotebookMetadata.id)) {
				throw new Error("No first notebook id even after refetch!");
			}

			console.log(
				"No notebook selected, setting first notebook",
				firstNotebookMetadata.id,
			);

			generalCtx.setState({
				botConversationId: firstNotebookMetadata.bot_conversation?.id ?? null,
				notebookId: firstNotebookMetadata.id,
			});

			return true;
		},
	});
}
