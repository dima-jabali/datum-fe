import {
	type InfiniteData,
	useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useState } from "react";

import { useWithOrganizationId } from "#/contexts/general/ctx";
import { identity } from "#/lib/utils";
import type { PageLimit, PageOffset } from "#/types/general";
import { type NotebookMetadata } from "#/types/notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type FetchNotebookListPageParams = {
	sort_direction?: string | null | undefined;
	archived?: string | null | undefined;
	sort?: string | null | undefined;
	offset: PageOffset;
	limit: PageLimit;
};

export type FetchNotebookListPageResponse = {
	results: Array<NotebookMetadata>;
	num_results: number;
	offset: string;
	limit: string;
};

export type FetchNotebookListPageInfiniteData = InfiniteData<
	FetchNotebookListPageResponse,
	FetchNotebookListPageParams
>;

type SelectedListPage<SelectedData = FetchNotebookListPageInfiniteData> = (
	data: FetchNotebookListPageInfiniteData,
) => SelectedData;

export function useGetNotebookListPage<
	SelectedData = FetchNotebookListPageInfiniteData,
>(
	select: SelectedListPage<SelectedData> = identity<
		FetchNotebookListPageInfiniteData,
		SelectedData
	>,
) {
	const organizationId = useWithOrganizationId();

	const [{ initialPageParam, queryOptions }] = useState(() => {
		const initialPageParam: FetchNotebookListPageParams = {
			sort_direction: undefined,
			offset: 0 as PageOffset,
			limit: 20 as PageLimit,
			archived: undefined,
			sort: undefined,
		};

		const queryOptions =
			queryKeyFactory.get["notebook-list-page"](organizationId);

		return { initialPageParam, queryOptions };
	});

	return useSuspenseInfiniteQuery({
		staleTime: 5 * 60 * 1_000,
		gcTime: Infinity, // Maintain on cache
		initialPageParam,
		...queryOptions,
		select,
		getNextPageParam(
			lastPage,
			_allPages,
			lastPageParams,
			// _allPagesParams,
		) {
			const nextOffset = (lastPageParams.offset +
				lastPageParams.limit) as PageOffset;

			if (lastPage && nextOffset > lastPage.num_results) return;

			return { ...lastPageParams, offset: nextOffset };
		},
		getPreviousPageParam(
			_firstPage,
			_allPages,
			firstPageParams,
			// _allPagesParams,
		) {
			const prevOffset = (firstPageParams.offset -
				firstPageParams.limit) as PageOffset;

			if (prevOffset < 0) return;

			return { ...firstPageParams, offset: prevOffset };
		},
	});
}

function selectHasNotebooksInList(data: FetchNotebookListPageInfiniteData) {
	return data.pages.some((page) => page.results.length > 0);
}
export function useHasNotebooksInList() {
	return useGetNotebookListPage(selectHasNotebooksInList).data;
}
