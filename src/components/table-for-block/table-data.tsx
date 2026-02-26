import {
	type SortingState,
	createColumnHelper,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
	type ExpandedState,
} from "@tanstack/react-table";
import { memo, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { AnyColumnDef } from "#/components/tan-stack-table/table-utils";
import {
	useSetTableData,
	useTableData,
} from "#/components/table-for-block/table-data-context-utils";
import { DATA_ID_KEY } from "#/components/table-for-block/utils";
import { TanStackTable } from "#/components/tan-stack-table/tan-stack-table";
import { DefaultFallbackErrorComponent } from "#/components/default-fallback-error-component";
import { LOADER } from "#/components/loader";

const TIMEOUT_TO_SORT_REMOTELLY = 1_000;

function TanStackTableData() {
	const [columns, setColumns] = useState<Array<AnyColumnDef>>([]);
	const [expanded, setExpanded] = useState<ExpandedState>({});
	const [sorting, setSorting] = useState<SortingState>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any[]>([]);

	const timerToSortRemotellyRef = useRef<NodeJS.Timeout>(undefined);

	const setTableData = useSetTableData();
	const {
		numberOfRowsPerPage,
		totalNumberOfRows,
		isFetchingData,
		isSortingData,
		isNewSource,
		canScroll,
		currPage,
		allData,
	} = useTableData((store) => ({
		numberOfRowsPerPage: store.numberOfRowsPerPage,
		totalNumberOfRows: store.totalNumberOfRows,
		isFetchingData: store.isFetchingData,
		isSortingData: store.isSortingData,
		isNewSource: store.isNewSource,
		canScroll: store.canScroll,
		currPage: store.currPage,
		allData: store.allData,
	}));

	const table = useReactTable({
		pageCount: Math.ceil((totalNumberOfRows ?? 0) / numberOfRowsPerPage) || 1,
		state: { expanded, sorting },
		columnResizeMode: "onEnd",
		enableRowSelection: true,
		manualPagination: true,
		enableMultiSort: true,
		manualSorting: true,
		debugAll: false,
		columns,
		data,
		getExpandedRowModel: getExpandedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		onExpandedChange: setExpanded,
		onSortingChange: setSorting,
	});

	useEffect(() => {
		const sortRemotellyBy = (sort_by: string[] | undefined) => {
			clearTimeout(timerToSortRemotellyRef.current);

			timerToSortRemotellyRef.current = setTimeout(() => {
				setTableData((prev) => ({
					blockFilterAndSort: {
						filters: prev.blockFilterAndSort?.filters,
						sort_by,
					},
				}));
			}, TIMEOUT_TO_SORT_REMOTELLY);
		};

		if (sorting.length > 0) {
			const sort = sorting.map((sort) => (sort.desc ? `-${sort.id}` : sort.id));

			sortRemotellyBy(sort);
		} else {
			sortRemotellyBy(undefined);
		}
	}, [setTableData, sorting]);

	useEffect(() => {
		setTableData({ table });
	}, [setTableData, table]);

	useEffect(() => {
		if (isNewSource) {
			setColumns([]);
			setData([]);
		} else if (!isFetchingData) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const columnHelper = createColumnHelper<any>();
			const columns: Array<AnyColumnDef> = [];
			const data = [];

			{
				const startIndexAndId =
					currPage * numberOfRowsPerPage - numberOfRowsPerPage;
				let endIndexAndId = startIndexAndId + numberOfRowsPerPage;
				let isFirstRow = true;

				if (endIndexAndId > (totalNumberOfRows ?? 0) - 1) {
					endIndexAndId = totalNumberOfRows ?? 0;
				}

				for (let key = startIndexAndId; key < endIndexAndId; ++key) {
					const row = allData.get(key);

					if (row) {
						data.push(row);

						if (isFirstRow) {
							Object.keys(row).forEach((columnName) => {
								if (columnName === DATA_ID_KEY) {
									const column = columnHelper.accessor(columnName, {
										cell: (info) => info.getValue(),
										enableColumnFilter: false,
										enableResizing: false,
										enableGrouping: true,
										enableSorting: false,
										enableHiding: false,
										header: "Index",
										id: columnName,
										size: 50,
										meta: {
											isLocalIndexColumn: true,
										},
									});

									columns.unshift(column); // This column should be first.
								} else {
									const column = columnHelper.accessor(columnName, {
										cell: (info) => info.getValue(),
										enableColumnFilter: true,
										enableGrouping: true,
										enableResizing: true,
										enableSorting: true,
										header: columnName,
										enableHiding: true,
										id: columnName,
									});

									columns.push(column);
								}
							});

							isFirstRow = false;
						}
					} else {
						console.log(
							"Item does not exist in all table data but should!\nIgnore this error if you are at the last page and there are no more items or if the table is rendering table from a malformed CSV file.",
							{
								numberOfRowsPerPage,
								currPage,
								allData,
								key,
							},
						);
					}
				}
			}

			setColumns(columns);
			setData(data);
		}
	}, [
		numberOfRowsPerPage,
		totalNumberOfRows,
		isFetchingData,
		isNewSource,
		currPage,
		allData,
		setTableData,
	]);

	return isSortingData ? (
		SORTING
	) : (
		<TanStackTable canScroll={canScroll} table={table} />
	);
}

export const MemoTableData = memo(function MemoTanStackTableData() {
	return (
		<ErrorBoundary FallbackComponent={DefaultFallbackErrorComponent}>
			<TanStackTableData />
		</ErrorBoundary>
	);
});

const SORTING = (
	<div className="flex w-full grow items-center justify-center gap-4 text-base">
		Sorting/Filtering data… {LOADER}
	</div>
);
