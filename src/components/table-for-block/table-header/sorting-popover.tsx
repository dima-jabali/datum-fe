import type { Column } from "@tanstack/react-table";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "lucide-react";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import { SortOrder } from "#/components/table-for-block/filters/utilityTypes";
import {
	useSetTableData,
	useTableData,
} from "#/components/table-for-block/table-data-context-utils";
import { COLUMNS_FALLBACK } from "#/components/table-for-block/table-header/utils";

type SortBy = { columnName: string; order: SortOrder }[];

export function SortingPopover() {
	const [sortBy, setSortBy] = useState<SortBy>([]);
	const [isOpen, setIsOpen] = useState(false);

	const prevIsOpenRef = useRef(false);

	const { table, blockFilterAndSort } = useTableData((store) => ({
		blockFilterAndSort: store.blockFilterAndSort,
		table: store.table,
	}));
	const setTableData = useSetTableData();

	const columns = useMemo(() => {
		if (!isOpen) {
			return COLUMNS_FALLBACK;
		}

		const columns =
			table?.getAllColumns().filter((col) => col.getCanSort()) ||
			COLUMNS_FALLBACK;

		return columns;
	}, [isOpen, table]);

	useLayoutEffect(() => {
		if (prevIsOpenRef.current && !isOpen) {
			const sort = [];

			for (const col of sortBy) {
				if (col.order === SortOrder.NONE) continue;

				sort.push({ id: col.columnName, desc: col.order === SortOrder.DESC });
			}

			table?.setSorting(sort);

			setTableData((prev) => {
				const newSortBy = sortBy.map(
					({ columnName, order }) =>
						`${order === SortOrder.ASC ? "" : "-"}${columnName}`,
				);

				const sort_by = newSortBy.length > 0 ? newSortBy : undefined;

				return {
					...prev,
					blockFilterAndSort: {
						filters: prev.blockFilterAndSort?.filters,
						sort_by,
					},
				};
			});
		}

		prevIsOpenRef.current = isOpen;
	}, [columns, isOpen, setTableData, sortBy, table]);

	useLayoutEffect(() => {
		setSortBy(
			blockFilterAndSort?.sort_by?.map((item) => {
				const isDesc = item.startsWith("-");

				return {
					order: isDesc ? SortOrder.DESC : SortOrder.ASC,
					columnName: isDesc ? item.slice(1) : item,
				};
			}) || [],
		);
	}, [blockFilterAndSort?.sort_by]);

	function handleToggleSort(column: Column<any, unknown>) {
		setSortBy((prev) => {
			const colIndex = prev?.findIndex((item) => item.columnName === column.id);

			if (colIndex === -1) {
				return [...prev, { columnName: column.id, order: SortOrder.ASC }];
			} else {
				if (prev[colIndex]!.order === SortOrder.ASC) {
					const copy = [...prev];

					copy.splice(colIndex, 1, {
						...prev[colIndex]!,
						order: SortOrder.DESC,
					});

					return copy;
				} else {
					return prev.filter((item) => item.columnName !== column.id);
				}
			}
		});
	}

	return (
		<NativePopover isOpen={isOpen} onOpenChange={setIsOpen}>
			<NativePopoverTrigger className="flex h-[21px] cursor-pointer items-center justify-center gap-2 rounded-sm pl-2 pr-3 text-muted-foreground button-hover">
				<div className="flex flex-col items-center justify-center">
					<ChevronUpIcon className="mb-[-2px] size-3 stroke-muted-foreground" />

					<ChevronDownIcon className="mt-[-2px] size-3 stroke-muted-foreground" />
				</div>
				Sort
			</NativePopoverTrigger>

			{isOpen && (
				<NativePopoverContent
					className="max-h-[50vh] flex-col gap-1 text-sm"
					position="bottom"
				>
					{columns.map((column) => {
						const order = matchSortOrder(sortBy, column);

						return (
							<button
								className="group flex w-full items-center justify-between gap-6 p-1"
								onPointerUp={() => handleToggleSort(column)}
								key={column.id}
								type="button"
							>
								<div className="flex items-center justify-center gap-2 text-left">
									{column.id}

									{order === SortOrder.ASC ? (
										<ChevronUpIcon className="size-3 flex-none" />
									) : order === SortOrder.DESC ? (
										<ChevronDownIcon className="size-3 flex-none" />
									) : (
										<MinusIcon className="size-3 flex-none" />
									)}
								</div>

								<span
									data-order={order}
									className="flex w-12 items-center justify-center rounded-sm bg-button-hover p-1 px-2 text-center text-xs font-bold uppercase text-primary/80 transition-none group-hover:bg-button-active group-hover:text-black group-focus:bg-button-active group-focus:text-black data-[order=asc]:bg-blue-500 data-[order=desc]:bg-yellow-700 data-[order=asc]:group-hover:bg-blue-400 data-[order=desc]:group-hover:bg-yellow-500 data-[order=asc]:group-focus:bg-blue-400 data-[order=desc]:group-focus:bg-yellow-500"
								>
									{order}
								</span>
							</button>
						);
					})}
				</NativePopoverContent>
			)}
		</NativePopover>
	);
}

function matchSortOrder(sortBy: SortBy, column: Column<any, unknown>) {
	const isPresent = sortBy.find((item) => item.columnName === column.id);

	if (isPresent) {
		return isPresent.order as SortOrder;
	} else {
		return SortOrder.NONE;
	}
}
