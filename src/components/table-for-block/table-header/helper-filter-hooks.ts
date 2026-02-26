import { useState } from "react";

import {
	CASE_SENSITIVE_KEY,
	COLUMN_KEY,
	VALUE_KEY,
	VALUE_OPERATOR_KEY,
} from "#/components/table-for-block/filters/filters";
import {
	type ChildFilter,
	type ColumnInfo,
	type Filter,
	FilterOperator,
	ValueOperator,
} from "#/components/table-for-block/filters/utilityTypes";
import {
	modifyChildFilter,
	withFilter,
	withFilterOperator,
	withoutFilter,
} from "#/components/table-for-block/table-header/filters-to-be-applied/helpers";
import { useSetTableData } from "#/components/table-for-block/table-data-context-utils";

export const useSelectColumnToFilter = () => {
	const setTableData = useSetTableData();

	const [{ selectFilterType }] = useState({
		selectFilterType: (
			filterToBeModified: ChildFilter,
			newColumnInfo: ColumnInfo,
		) => {
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				modifyChildFilter(
					newTableData.groupOfFilters,
					filterToBeModified,
					COLUMN_KEY,
					newColumnInfo,
				);

				// Also, reset the `valueOperator` and `value` to `undefined`:
				modifyChildFilter(
					newTableData.groupOfFilters,
					filterToBeModified,
					VALUE_OPERATOR_KEY,
					undefined,
				);

				modifyChildFilter(
					newTableData.groupOfFilters,
					filterToBeModified,
					VALUE_KEY,
					undefined,
				);

				return newTableData;
			});
		},
	});

	return selectFilterType;
};

export const useSetValueOperator = () => {
	const setTableData = useSetTableData();

	const [{ setValueOperator }] = useState({
		setValueOperator: (
			filterToBeModified: ChildFilter,
			newValueOperator: ValueOperator,
		) =>
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				modifyChildFilter(
					newTableData.groupOfFilters,
					filterToBeModified,
					VALUE_OPERATOR_KEY,
					newValueOperator,
				);

				return newTableData;
			}),
	});

	return setValueOperator;
};

export const useSetAnd_or_Or = () => {
	const setTableData = useSetTableData();

	const [{ setAnd_or_Or }] = useState({
		setAnd_or_Or: (filter: Filter, newFilterOperator: FilterOperator) => {
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				withFilterOperator(
					newTableData.groupOfFilters,
					newFilterOperator,
					filter,
				);

				return newTableData;
			});
		},
	});

	return setAnd_or_Or;
};

export const useAddFilter = () => {
	const setTableData = useSetTableData();

	const [{ addFilter }] = useState({
		addFilter: (newFilter: Filter, filterAbove?: Filter) => {
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				withFilter(newTableData.groupOfFilters, newFilter, filterAbove);

				return newTableData;
			});
		},
	});

	return addFilter;
};

export const useDeleteFilter = () => {
	const setTableData = useSetTableData();

	const [{ deleteFilter }] = useState({
		deleteFilter: (filterToDelete: Filter) => {
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				withoutFilter(oldTableData.groupOfFilters, filterToDelete);

				return newTableData;
			});
		},
	});

	return deleteFilter;
};

export const useSetFilterValue = () => {
	const setTableData = useSetTableData();

	const [{ setFilterValue }] = useState({
		setFilterValue: (
			newValue: string | { from: string; to: string } | number | undefined,
			filterToBeModified: ChildFilter,
		) => {
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				modifyChildFilter(
					newTableData.groupOfFilters,
					filterToBeModified,
					VALUE_KEY,
					newValue,
				);

				return newTableData;
			});
		},
	});

	return setFilterValue;
};

export const useSetCaseSensitive = () => {
	const setTableData = useSetTableData();

	const [{ setCaseSensitive }] = useState({
		setCaseSensitive: (newValue: boolean, filterToBeModified: ChildFilter) => {
			setTableData((oldTableData) => {
				const newTableData = {
					...oldTableData,
					forceRender: !oldTableData.forceRender,
				};

				modifyChildFilter(
					newTableData.groupOfFilters,
					filterToBeModified,
					CASE_SENSITIVE_KEY,
					newValue,
				);

				return newTableData;
			});
		},
	});

	return setCaseSensitive;
};
