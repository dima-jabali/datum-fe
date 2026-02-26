import { isRecord } from "#/lib/utils";
import {
	CHILDREN_KEY,
	COLUMN_KEY,
	PARENT_KEY,
	shouldHaveValueInput,
	VALUE_OPERATOR_KEY,
} from "#/components/table-for-block/filters/filters";
import {
	isSerializedFilterGroup,
	isUndefined,
} from "#/components/table-for-block/filters/typeGuards";
import type {
	ChildFilter,
	ColumnInfo,
	EntriesOfFilter,
	Filter,
	FilterGroup,
	SerializedChildFilter,
	SerializedFilter,
} from "#/components/table-for-block/filters/utilityTypes";

export function serializeFiltersToJson(
	filter: Filter,
	visited = new Set<Filter>(),
): SerializedFilter | undefined {
	// This is a function made by an AI to filter out objects with undefined values and handle circular references.

	if (visited.has(filter)) return;

	visited.add(filter);

	const serializedObj: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(filter) as EntriesOfFilter) {
		if (key === PARENT_KEY || value === undefined) continue;

		if (key === CHILDREN_KEY) {
			const serializedArray: unknown[] = [];

			for (const child of value as Filter[]) {
				const serializedValues = serializeFiltersToJson(child, visited);

				if (serializedValues) {
					serializedArray.push(serializedValues);
				}
			}

			if (serializedArray.length > 0) {
				serializedObj[key] = serializedArray;
			}
		} else if (
			key === COLUMN_KEY &&
			typeof (value as ColumnInfo).name === "string"
		) {
			if ((value as ColumnInfo).name) {
				serializedObj[key] = value as ColumnInfo; // non-empty string
			}
		} else if (key === VALUE_OPERATOR_KEY) {
			if (value === undefined) continue;

			if (shouldHaveValueInput(filter as ChildFilter)) {
				if ((filter as ChildFilter).value !== undefined) {
					serializedObj[key] = value;
				}
			} else {
				serializedObj[key] = value;
			}
		} else {
			serializedObj[key] = value;
		}
	}

	return isValidSerializedFilter(serializedObj) ? serializedObj : undefined;
}

function isValidSerializedFilter(
	obj: Record<string, unknown>,
): obj is SerializedFilter {
	if (!isRecord(obj)) return false;

	if (Object.keys(obj).length < 2) return false;

	if (isSerializedFilterGroup(obj)) {
		const { filterOperator, children } = obj;

		if (isUndefined(filterOperator) || isUndefined(children)) {
			return false;
		}

		return true;
	} else {
		const { value, valueOperator, caseSensitive, column } =
			obj as SerializedChildFilter;

		if (
			isUndefined(valueOperator) ||
			isUndefined(caseSensitive) ||
			isUndefined(column)
		) {
			return false;
		}

		if (shouldHaveValueInput(obj as ChildFilter)) {
			if (isUndefined(value)) return false;
		}

		return true;
	}
}

export function deserializeJsonToFilters(
	json: SerializedFilter | undefined,
	objs: Filter[] = [],
): Filter | undefined {
	if (!json) return;

	if (isSerializedFilterGroup(json)) {
		const filterGroup: FilterGroup = {
			filterOperator: json.filterOperator,
			parent: undefined,
			children: [],
		};

		objs.push(filterGroup);

		filterGroup.children = json.children
			.map((childJson) => deserializeJsonToFilters(childJson, objs))
			.filter(Boolean) as Filter[];

		return filterGroup;
	} else {
		// It's a ChildFilter
		const childFilter: ChildFilter = {
			parent: objs.at(-1) as FilterGroup,
			valueOperator: json.valueOperator,
			caseSensitive: json.caseSensitive,
			column: json.column,
			value: json.value,
		};

		return childFilter;
	}
}
