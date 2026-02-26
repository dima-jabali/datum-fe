import { Layers, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import type {
	ChildFilter,
	Filter,
	FilterGroup,
} from "#/components/table-for-block/filters/utilityTypes";
import { useGroupOfFilters } from "#/components/table-for-block/table-data-context-utils";
import { useAddFilter } from "#/components/table-for-block/table-header/helper-filter-hooks";
import {
	FILL_FILTERS_FIRST,
	hasColumnAndConstrainsSpecified,
	hasFilter,
} from "#/components/table-for-block/table-header/utils";
import { makeDefaultGroupOfFilters } from "#/components/table-for-block/filters/filters";

type Props = {
	parentFilter?: FilterGroup | undefined;
	filterAbove?: Filter | undefined;
	flexStart?: boolean | undefined;
};

export function AddFilterButtons({
	parentFilter,
	filterAbove,
	flexStart,
}: Props) {
	const groupOfFilters = useGroupOfFilters();

	const addFilter = useAddFilter();

	function canAddFilter() {
		if (!hasFilter(groupOfFilters)) {
			return true;
		}

		const filter = parentFilter || groupOfFilters;
		if (filter && !hasColumnAndConstrainsSpecified(filter)) {
			return false;
		}

		if (filterAbove) {
			if (!hasColumnAndConstrainsSpecified(filterAbove)) {
				return false;
			}
		}

		return true;
	}

	function addFilterRule() {
		if (!canAddFilter()) {
			toast.error(FILL_FILTERS_FIRST);

			return;
		}

		const newFilter: ChildFilter = {
			parent: parentFilter || groupOfFilters,
			column: { name: "", type: undefined },
			valueOperator: undefined,
			caseSensitive: false,
			value: undefined,
		};

		addFilter(newFilter, filterAbove);
	}

	function addFilterGroup() {
		if (!canAddFilter()) {
			toast.error(FILL_FILTERS_FIRST);

			return;
		}

		const defaultFilterGroup = makeDefaultGroupOfFilters();

		defaultFilterGroup.parent = parentFilter || groupOfFilters;

		addFilter(defaultFilterGroup, filterAbove);
	}

	return (
		<>
			<button
				className="flex justify-center items-center w-full gap-2 rounded border border-border-smooth py-1 px-2 button-hover text-sm data-[flex-start=true]:justify-start disabled:opacity-50"
				aria-disabled={!canAddFilter()}
				data-flex-start={flexStart}
				onClick={addFilterRule}
				type="button"
			>
				<PlusIcon className="size-4 text-primary" />
				Add filter rule
			</button>

			<button
				className="flex justify-center items-center w-full gap-2 rounded border border-border-smooth py-1 px-2 button-hover text-sm data-[flex-start=true]:justify-start disabled:opacity-50"
				aria-disabled={!canAddFilter()}
				data-flex-start={flexStart}
				onClick={addFilterGroup}
				type="button"
			>
				<Layers className="size-4 text-primary" />
				Add filter group
			</button>
		</>
	);
}
