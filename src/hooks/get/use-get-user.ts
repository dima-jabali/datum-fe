import { useSuspenseQuery } from "@tanstack/react-query";

import { queryKeyFactory } from "#/hooks/query-key-factory";

const queryOptions = queryKeyFactory.get["user"];

export function useGetUser() {
	return useSuspenseQuery({
		staleTime: Infinity, // Maintain on cache
		...queryOptions,
	}).data;
}
