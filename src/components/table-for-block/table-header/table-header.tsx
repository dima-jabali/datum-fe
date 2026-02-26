import { memo, useLayoutEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import {
	useSetTableData,
	useTableData,
} from "#/components/table-for-block/table-data-context-utils";
import { makeDefaultGroupOfFilters } from "#/components/table-for-block/filters/filters";
import { cn, noop } from "#/lib/utils";
import { FiltersButtonForPopover } from "#/components/table-for-block/table-header/filters-button-for-popover";
import { SortingPopover } from "#/components/table-for-block/table-header/sorting-popover";
import { PopoverForColumnChooser } from "#/components/table-for-block/table-header/popover-for-column-chooser";

type Props = {
	showResetFiltersButton?: boolean;
	showFiltersButton?: boolean;
	showDisplayButton?: boolean;
	showExpandButton?: boolean;
	showSortButton?: boolean;
	className?: string;
};

export const MemoDefaultTableHeader = memo(function DefaultTableHeader({
	showResetFiltersButton = true,
	showDisplayButton = true,
	showFiltersButton = true,
	showExpandButton = true,
	showSortButton = true,
	className,
}: Props) {
	const [isExpanded, setIsExpanded] = useState(true);

	const { reload, tableWrapperRef } = useTableData((store) => ({
		tableWrapperRef: store.tableWrapperRef,
		reload: store.reload,
	}));
	const setTableData = useSetTableData();

	useLayoutEffect(() => {
		if (!tableWrapperRef?.current) return;

		const linearGradientDiv = tableWrapperRef.current.getElementsByClassName(
			"table-linear-gradient",
		)?.[0] as HTMLDivElement | null;

		if (!linearGradientDiv) return;

		Object.assign(tableWrapperRef.current.style, {
			height: isExpanded ? "" : "6rem",
		} as CSSStyleDeclaration);

		Object.assign(linearGradientDiv.style, {
			display: isExpanded ? "none" : "block",
			top: "30px",
		} as CSSStyleDeclaration);
	}, [isExpanded, tableWrapperRef]);

	function reloadTableData() {
		setTableData((prev) => ({
			groupOfFilters: makeDefaultGroupOfFilters(),
			forceRender: !prev.forceRender,
		}));

		requestAnimationFrame(() => {
			reload?.().catch(noop);
		});
	}

	function handleResetModifiers() {
		setTableData((prev) => ({
			blockFilterAndSort: {
				filters: undefined,
				sort_by: undefined,
			},
			groupOfFilters: makeDefaultGroupOfFilters(),
			forceRender: !prev.forceRender,
		}));
	}

	return (
		<header
			className={cn(
				"relative flex justify-between items-center h-[30px] mobile:h-11 flex-none w-full bg-transparent border-border-smooth border-0 border-b-[1px] py-0 px-1 simple-scrollbar",
				className,
			)}
		>
			<div className="flex items-center justify-center h-full">
				{showFiltersButton ? <FiltersButtonForPopover /> : null}

				{showSortButton ? <SortingPopover /> : null}
			</div>

			<div className="flex items-center justify-center h-full">
				{showResetFiltersButton ? (
					<button
						className="text-xs border border-transparent button-hover px-2 py-0.5 rounded-sm text-muted-foreground"
						title="Clear all filters and sorting"
						onClick={handleResetModifiers}
						type="button"
					>
						Reset filters
					</button>
				) : null}

				{reload ? (
					<button
						className="text-xs border border-transparent button-hover px-2 py-0.5 rounded-sm text-muted-foreground"
						onClick={reloadTableData}
					>
						Reload
					</button>
				) : null}

				{showDisplayButton ? <PopoverForColumnChooser /> : null}

				{showExpandButton ? (
					<button
						className="text-xs border border-transparent button-hover aspect-square p-0.5 flex items-center justify-center rounded-sm text-muted-foreground"
						onClick={() => setIsExpanded((prev) => !prev)}
						title="Toggle expand table"
					>
						<ChevronDownIcon
							className="data-[is-expanded=true]:rotate-180 stroke-muted-foreground size-4"
							data-is-expanded={isExpanded}
						/>
					</button>
				) : null}
			</div>
		</header>
	);
});
