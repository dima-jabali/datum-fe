import { useIsMutating } from "@tanstack/react-query";

import { queryKeyFactory } from "#/hooks/query-key-factory";

const queryOptions = {
	mutationKey: queryKeyFactory.post["notebook"].queryKey,
};

export function useIsCreatingNotebook() {
	return useIsMutating(queryOptions) > 0;
}
