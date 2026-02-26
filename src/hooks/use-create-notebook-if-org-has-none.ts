import { useQuery } from "@tanstack/react-query";

import { useWithOrganizationId } from "#/contexts/general/ctx";
import { useHasNotebooksInList } from "#/hooks/get/use-get-notebook-list-page";
import { useCreateNotebook } from "#/hooks/mutation/use-create-notebook";
import { createNotebookUuid } from "#/lib/utils";

type HasCreatedNotebook = boolean;

export function useCreateNotebookIfOrgHasNone() {
	const hasNotebooksInList = useHasNotebooksInList();
	const organizationId = useWithOrganizationId();
	const createNotebook = useCreateNotebook();

	return useQuery({
		queryKey: ["create-notebook-if-org-has-none", organizationId],
		enabled: !hasNotebooksInList,
		refetchOnMount: true,
		throwOnError: false,
		staleTime: 0, // Important
		retry: true,
		gcTime: 0, // Important
		queryFn: async (): Promise<HasCreatedNotebook> => {
			await createNotebook.mutateAsync({
				metadata: {
					uuid: createNotebookUuid(),
					title: "New Chat",
				},
				organizationId,
				blocks: [],
			});

			return true;
		},
	});
}
