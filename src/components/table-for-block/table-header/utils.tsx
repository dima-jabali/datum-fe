import { useLayoutEffect, useState } from "react";
import type { Column } from "@tanstack/react-table";
import {
	ChevronsUpDownIcon,
	CircleHelp,
	ClockIcon,
	FileText,
	Hash,
	TrendingUp,
} from "lucide-react";

import {
	FilterType,
	type Filter,
	type FilterGroup,
} from "#/components/table-for-block/filters/utilityTypes";
import {
	CHILDREN_KEY,
	COLUMN_KEY,
} from "#/components/table-for-block/filters/filters";
import { useTable } from "#/components/table-for-block/table-data-context-utils";

export const COLUMNS_FALLBACK: Column<any, unknown>[] = [];

export const FILL_FILTERS_FIRST = "Fill filters first";

export function hasFilter(rootFilter: FilterGroup): boolean {
	if (!rootFilter) return false;
	if (rootFilter.children.length === 0) return false;

	const firstChild = rootFilter.children[0];

	if (
		firstChild &&
		CHILDREN_KEY in firstChild &&
		firstChild.children.length === 0
	) {
		return false;
	}

	return true;
}

export function hasColumnAndConstrainsSpecified(filter: Filter): boolean {
	if (CHILDREN_KEY in filter) {
		const lastChild = filter.children[filter.children.length - 1];

		if (
			lastChild &&
			COLUMN_KEY in lastChild &&
			(!lastChild.column.name || !lastChild.valueOperator)
		) {
			return false;
		} else if (lastChild && CHILDREN_KEY in lastChild) {
			return hasColumnAndConstrainsSpecified(lastChild);
		}
	}

	return true;
}

export function matchDataTypeToFilterType(dataType: string): FilterType {
	switch (dataType) {
		case "number":
			return FilterType.float64;
		case "boolean":
			return FilterType.bool;
		default:
			return FilterType.object;
	}
}

export function matchFilterIcon(
	filterType: keyof typeof FilterType | undefined,
): React.ReactNode | null {
	switch (filterType) {
		case FilterType.float64:
		case FilterType.int64:
			return <Hash className="size-4 flex-none text-primary" />;

		case FilterType.object:
			return <FileText className="size-4 flex-none text-primary" />;

		case FilterType.bool:
			return <CircleHelp className="size-4 flex-none text-primary" />;

		case FilterType.datetime64:
			return <ClockIcon className="size-4 flex-none text-primary" />;

		case FilterType.timedelta:
			return <TrendingUp className="size-4 flex-none text-primary" />;

		case FilterType.category:
			return <ChevronsUpDownIcon className="size-4 flex-none text-primary" />;

		case undefined:
			return <div></div>;

		default:
			console.error(`Unknown filter type: '${filterType}'`);
			return <div></div>;
	}
}

export function useColumnFilter() {
	const [searchResults, setSearchResults] = useState(COLUMNS_FALLBACK);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [searchString, setSearchString] = useState("");

	const table = useTable();

	useLayoutEffect(() => {
		const columns =
			table?.getAllColumns().filter((col) => col.getCanFilter()) ||
			COLUMNS_FALLBACK;

		const trimmedSearchString = searchString.trim().toLocaleLowerCase();
		const hasValidString = Boolean(trimmedSearchString);
		const filtered: typeof columns = [];

		const firstRow = table?.getRowModel().rows[0];

		columns.forEach((item) => {
			if (firstRow) {
				const cellValue = firstRow.getValue(item.id);

				// Putting it inside item so we can easily access it.
				Reflect.set(item, "type", matchDataTypeToFilterType(typeof cellValue));
			}

			if (
				hasValidString &&
				item.id.toLocaleLowerCase().includes(trimmedSearchString)
			) {
				filtered.push(item);
			}
		});

		setSearchResults(hasValidString ? filtered : columns);
	}, [searchString, table]);

	return {
		searchResults,
		isPopoverOpen,
		searchString,
		setIsPopoverOpen,
		setSearchString,
	};
}
