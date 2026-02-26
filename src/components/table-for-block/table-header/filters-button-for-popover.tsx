import { CheckIcon, FunnelIcon, MinusIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import {
	useSetTableData,
	useTableData,
} from "#/components/table-for-block/table-data-context-utils";
import { generalCtx } from "#/contexts/general/ctx";
import { makeDefaultGroupOfFilters } from "#/components/table-for-block/filters/filters";
import { serializeFiltersToJson } from "#/components/table-for-block/filters/serialize";
import { Dialog, DialogContent, DialogTrigger } from "#/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { FiltersToBeApplied } from "#/components/table-for-block/table-header/filters-to-be-applied";
import { AddFilterButtons } from "#/components/table-for-block/table-header/add-filter-popover";

export function FiltersButtonForPopover() {
	const { groupOfFilters, isFiltersPopoverOpen } = useTableData((store) => ({
		isFiltersPopoverOpen: store.isFiltersPopoverOpen,
		groupOfFilters: store.groupOfFilters,
	}));
	const isMobile = generalCtx.use.isMobile();
	const setTableData = useSetTableData();

	const hasOpenedRef = useRef(false);

	function handleDeleteAllFilters() {
		setTableData((prev) => ({
			...prev,
			groupOfFilters: makeDefaultGroupOfFilters(),
		}));
	}

	function handleApplyFilters() {
		setTableData((prev) => ({
			...prev,
			isFiltersPopoverOpen: false,
		}));
	}

	useEffect(() => {
		// Prevent re-rendering when popover is open:
		if (isFiltersPopoverOpen) {
			hasOpenedRef.current = true;

			return;
		}

		if (!hasOpenedRef.current) return;

		let serializedFiltersOrUndefined = serializeFiltersToJson(groupOfFilters);
		let shouldChangeToFirstPage = true;

		if (Object.keys(serializedFiltersOrUndefined || {}).length === 0) {
			serializedFiltersOrUndefined = undefined;
			shouldChangeToFirstPage = false;
		}

		setTableData((prev) => ({
			...prev,
			currPage: shouldChangeToFirstPage ? 1 : prev.currPage,
			blockFilterAndSort: {
				sort_by: prev.blockFilterAndSort?.sort_by,
				filters: serializedFiltersOrUndefined,
			},
		}));
	}, [isFiltersPopoverOpen, groupOfFilters, setTableData]);

	const Trigger = isMobile ? DialogTrigger : PopoverTrigger;
	const Content = isMobile ? DialogContent : PopoverContent;
	const Root = isMobile ? Dialog : Popover;

	return (
		<Root
			onOpenChange={(newValue) =>
				setTableData((prev) => ({ ...prev, isFiltersPopoverOpen: newValue }))
			}
			open={isFiltersPopoverOpen}
		>
			<Trigger className="flex justify-center items-center h-[21px] rounded-sm py-0 px-2 text-xs button-hover text-muted-foreground gap-2">
				<FunnelIcon className="size-4 stroke-muted-foreground stroke-1" />
				Filters
			</Trigger>

			{isFiltersPopoverOpen ? (
				<Content
					className={`flex-col items-start p-0 justify-start text-sm ${isMobile ? "" : "max-h-[80dvh] min-w-sm max-w-[80dvw] w-[unset]"}`}
					suppressHydrationWarning
					side="right"
				>
					<>
						<FiltersToBeApplied />

						<div className="grid grid-rows-2 grid-cols-2 gap-1 pb-1 px-1 w-full">
							<AddFilterButtons />

							<button
								className="flex justify-center items-center gap-2 w-full border border-border-smooth rounded py-1 px-2 button-hover disabled:opacity-50"
								onClick={handleDeleteAllFilters}
							>
								<MinusIcon className="size-4 text-primary" />
								Delete all filters
							</button>

							<button
								className="flex justify-center items-center gap-2 w-full border border-border-smooth rounded py-1 px-2 button-hover disabled:opacity-50"
								onClick={handleApplyFilters}
							>
								<CheckIcon className="size-4 text-primary" />
								Apply
							</button>
						</div>
					</>
				</Content>
			) : null}
		</Root>
	);
}
