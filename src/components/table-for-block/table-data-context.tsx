import type { Table } from "@tanstack/react-table";
import { useState } from "react";
import { createStore, type StoreApi } from "zustand";

import {
	DEFAULT_FILTERS,
	makeDefaultGroupOfFilters,
} from "#/components/table-for-block/filters/filters";
import { deserializeJsonToFilters } from "#/components/table-for-block/filters/serialize";
import type { FilterGroup } from "#/components/table-for-block/filters/utilityTypes";
import { TableDataContext } from "#/components/table-for-block/table-data-context-utils";
import type { TableHelperStore } from "#/components/table-for-block/use-table-helper";
import { DATA_ID_KEY } from "#/components/table-for-block/utils";
import { isObjectEmpty } from "#/lib/utils";
import type {
	BlockCsv,
	BlockFilterAndSort,
	BlockSql,
	BlockTable,
} from "#/types/notebook";

export type TableDataContextType = Readonly<{
	setTableData: StoreApi<TableDataType>["setState"];
	store: StoreApi<TableDataType>;
}>;

export type TableDataType = Readonly<{
	setBlockFilterAndSort?:
		| React.Dispatch<React.SetStateAction<BlockFilterAndSort>>
		| undefined;
	setNumberOfRowsPerPage?: ((next: number) => void) | undefined;
	fetchMore?: TableHelperStore["paginate"] | undefined;
	setIsNewSource?: React.Dispatch<boolean> | undefined;
	handleResizeStop?: (() => void) | undefined;
	reload?: (() => Promise<void>) | undefined;

	allData: Map<
		number,
		{ [key: string]: string | number; [DATA_ID_KEY]: number }
	>;
	selectedCellRef?: React.RefObject<HTMLDivElement | null> | undefined;
	tableWrapperRef?: React.RefObject<HTMLDivElement | null> | undefined;
	block?: BlockSql | BlockCsv | BlockTable | undefined;
	blockFilterAndSort: BlockFilterAndSort;
	dataComesFromDataPreview: boolean;
	totalNumberOfRows: number | null;
	canScroll?: boolean | undefined;
	groupOfFilters: FilterGroup;
	numberOfRowsPerPage: number;
	initialPageNumber: number;
	currPage: number;

	isFiltersPopoverOpen: boolean;
	isFetchingData: boolean;
	isSortingData: boolean;
	isNewSource: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	table: Table<any> | null;

	forceRender: boolean;
}>;

export type DataForTable = NonNullable<
	ReturnType<TableDataType["allData"]["get"]>
>;

function createTableDataStore(initialBlockFilterAndSort?: BlockFilterAndSort) {
	return createStore<TableDataType>(
		() =>
			({
				dataComesFromDataPreview: false,
				isFiltersPopoverOpen: false,
				isSortingData: false,
				isFetchingData: true,

				groupOfFilters: initialBlockFilterAndSort?.filters
					? (deserializeJsonToFilters(
							initialBlockFilterAndSort.filters,
						) as FilterGroup)
					: makeDefaultGroupOfFilters(),
				blockFilterAndSort:
					initialBlockFilterAndSort && !isObjectEmpty(initialBlockFilterAndSort)
						? initialBlockFilterAndSort
						: DEFAULT_FILTERS,

				numberOfRowsPerPage: 10,
				totalNumberOfRows: null,
				initialPageNumber: 1,
				allData: new Map(),
				isNewSource: false,
				canScroll: true,
				currPage: 1,

				table: null,

				forceRender: true,
			}) satisfies TableDataType,
	);
}

export type TableDataStore = ReturnType<typeof createTableDataStore>;

export function TableDataProvider({
	initialBlockFilterAndSort,
	children,
}: React.PropsWithChildren<{
	initialBlockFilterAndSort?: BlockFilterAndSort | undefined;
}>) {
	const [state] = useState(() => {
		const store = createTableDataStore(initialBlockFilterAndSort);

		const setTableData = store.setState;

		return { store, setTableData };
	});

	return (
		<TableDataContext.Provider value={state}>
			{children}
		</TableDataContext.Provider>
	);
}
