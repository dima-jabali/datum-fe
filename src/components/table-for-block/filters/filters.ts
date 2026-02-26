import { isEqual } from "es-toolkit";

import type { BlockFilterAndSort } from "#/types/notebook";
import {
	FilterOperator,
	ValueOperator,
	type ChildFilter,
	type Filter,
	type FilterGroup,
} from "#/components/table-for-block/filters/utilityTypes";

const FILTERS_WITHOUT_VALUE_INPUT = [
	ValueOperator.IS_NOT_EMPTY,
	ValueOperator.IS_EMPTY,
	undefined,
	null,
];

export const DEFAULT_FILTERS: BlockFilterAndSort = {
	filters: undefined,
	sort_by: undefined,
};

export const VALUE_OPERATOR_KEY = "valueOperator";
export const CASE_SENSITIVE_KEY = "caseSensitive";
export const CHILDREN_KEY = "children";
export const PARENT_KEY = "parent";
export const COLUMN_KEY = "column";
export const VALUE_KEY = "value";

export function makeDefaultGroupOfFilters(): FilterGroup {
	const defaultParentFilter: FilterGroup = {
		filterOperator: FilterOperator.AND,
		children: [] as Filter[],
		parent: undefined,
	};

	const defaultChildFilter: ChildFilter = {
		column: { name: "", type: undefined },
		parent: defaultParentFilter,
		valueOperator: undefined,
		caseSensitive: false,
		value: undefined,
	};

	defaultParentFilter.children.push(defaultChildFilter);

	return defaultParentFilter;
}

export function shouldHaveValueInput(filterOperator: ChildFilter): boolean {
	return !FILTERS_WITHOUT_VALUE_INPUT.includes(filterOperator.valueOperator);
}

export function areFiltersEqual(a: BlockFilterAndSort, b: BlockFilterAndSort) {
	// JSON.stringify is needed to compare when there are objects with `undefined` or not existing values:
	const prevParsed = JSON.parse(JSON.stringify(a));
	const currParsed = JSON.parse(JSON.stringify(b));

	return isEqual(prevParsed, currParsed);
}
