export type Filter = ChildFilter | FilterGroup;

export type ChildFilter = {
	value: number | string | boolean | { from: string; to: string } | undefined;
	valueOperator: ValueOperator | undefined;
	caseSensitive: boolean;
	parent: FilterGroup;
	column: ColumnInfo;
};

export type FilterGroup = {
	parent: FilterGroup | undefined;
	filterOperator: FilterOperator;
	children: Filter[];
};

type AllNonNullable<T> = { [P in keyof T]-?: NonNullable<T[P]> };

export type SerializedFilterGroup = {
	children: AllNonNullable<ChildFilter>[];
	filterOperator: FilterOperator;
};

export type SerializedChildFilter = {
	value: number | string | boolean | { from: string; to: string };
	valueOperator: ValueOperator;
	caseSensitive: boolean;
	column: ColumnInfo;
};

export type SerializedFilter = SerializedChildFilter | SerializedFilterGroup;

export type ColumnInfo = {
	type: keyof typeof FilterType | undefined;
	name: string;
};

export type EntriesOfFilter = [
	keyof FilterGroup | keyof ChildFilter,
	FilterGroup[keyof FilterGroup] | ChildFilter[keyof ChildFilter],
][];

// Enums:

export enum FilterType {
	datetime64 = "datetime64",
	timedelta = "timedelta",
	category = "category",
	float64 = "float64",
	object = "object",
	int64 = "int64",
	bool = "bool",
}

export const ALL_FILTER_TYPES = Object.values(FilterType);

export enum FilterOperator {
	AND = "And",
	OR = "Or",
}

export enum ValueOperator {
	GREATER_OR_EQUAL_THAN = "Greater or equal than",
	LESS_OR_EQUAL_THAN = "Less or equal than",
	DOES_NOT_CONTAIN = "Does not contain",
	IS_NOT_IN_RANGE = "Is not in range",
	DOES_NOT_EQUAL = "Does not equal",
	IS_NOT_EMPTY = "Is not empty",
	GREATER_THAN = "Greater than",
	IS_IN_RANGE = "Is in range",
	STARTS_WITH = "Starts with",
	ENDS_WITH = "Ends with",
	LESS_THAN = "Less than",
	CONTAINS = "Contains",
	IS_EMPTY = "Is empty",
	EQUALS = "Equals",
}

export const AVAILABLE_VALUE_OPERATORS_FOR_TYPES: Readonly<
	Record<keyof typeof FilterType, readonly ValueOperator[]>
> = {
	category: [
		ValueOperator.GREATER_OR_EQUAL_THAN,
		ValueOperator.LESS_OR_EQUAL_THAN,
		ValueOperator.DOES_NOT_EQUAL,
		ValueOperator.GREATER_THAN,
		ValueOperator.IS_NOT_EMPTY,
		ValueOperator.LESS_THAN,
		ValueOperator.IS_EMPTY,
		ValueOperator.EQUALS,
	],
	int64: [
		ValueOperator.GREATER_OR_EQUAL_THAN,
		ValueOperator.LESS_OR_EQUAL_THAN,
		ValueOperator.DOES_NOT_EQUAL,
		ValueOperator.GREATER_THAN,
		ValueOperator.IS_NOT_EMPTY,
		ValueOperator.LESS_THAN,
		ValueOperator.IS_EMPTY,
		ValueOperator.EQUALS,
	],
	float64: [
		ValueOperator.GREATER_OR_EQUAL_THAN,
		ValueOperator.LESS_OR_EQUAL_THAN,
		ValueOperator.DOES_NOT_EQUAL,
		ValueOperator.GREATER_THAN,
		ValueOperator.IS_NOT_EMPTY,
		ValueOperator.LESS_THAN,
		ValueOperator.IS_EMPTY,
		ValueOperator.EQUALS,
	],
	datetime64: [
		ValueOperator.GREATER_OR_EQUAL_THAN,
		ValueOperator.LESS_OR_EQUAL_THAN,
		ValueOperator.DOES_NOT_EQUAL,
		ValueOperator.GREATER_THAN,
		ValueOperator.IS_NOT_EMPTY,
		ValueOperator.LESS_THAN,
		ValueOperator.IS_EMPTY,
		ValueOperator.EQUALS,
	],
	object: [
		ValueOperator.GREATER_OR_EQUAL_THAN,
		ValueOperator.LESS_OR_EQUAL_THAN,
		ValueOperator.DOES_NOT_CONTAIN,
		ValueOperator.DOES_NOT_EQUAL,
		ValueOperator.GREATER_THAN,
		ValueOperator.IS_NOT_EMPTY,
		ValueOperator.STARTS_WITH,
		ValueOperator.ENDS_WITH,
		ValueOperator.LESS_THAN,
		ValueOperator.IS_EMPTY,
		ValueOperator.CONTAINS,
		ValueOperator.EQUALS,
	],
	timedelta: [ValueOperator.IS_NOT_IN_RANGE, ValueOperator.IS_IN_RANGE],
	bool: [
		ValueOperator.DOES_NOT_EQUAL,
		ValueOperator.IS_NOT_EMPTY,
		ValueOperator.IS_EMPTY,
		ValueOperator.EQUALS,
	],
} as const;

export enum SortOrder {
	NONE = "none",
	DESC = "desc",
	ASC = "asc",
}
