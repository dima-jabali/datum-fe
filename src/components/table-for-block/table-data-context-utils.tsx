import { createContext, useContext } from "react";
import type { useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import type {
	TableDataContextType,
	TableDataStore,
} from "#/components/table-for-block/table-data-context";

export const TableDataContext = createContext<TableDataContextType | null>(
	null,
);

export function useTableData<T>(
	selector: Parameters<typeof useStore<TableDataStore, T>>[1],
) {
	const context = useContext(TableDataContext);

	if (!context) {
		throw new Error("`useTableData` must be used within a TableDataProvider");
	}

	return useStoreWithEqualityFn(context.store, selector, shallow);
}

/** Get table data from context without re-render */
export function useImmediateTableData() {
	const context = useContext(TableDataContext);

	if (!context) {
		throw new Error("`useTableData` must be used within a TableDataProvider");
	}

	return context.store;
}

export function useSetTableData() {
	const context = useContext(TableDataContext);

	if (!context) {
		throw new Error(
			"`useSetTableData` must be used within a TableDataProvider",
		);
	}

	return context.setTableData;
}

export function useBlockAndFilters() {
	return useTableData((state) => state.blockFilterAndSort);
}
export function useHandleResizeStop() {
	return useTableData((state) => state.handleResizeStop);
}
export function useGroupOfFilters() {
	return useTableData((state) => state.groupOfFilters);
}
export function useTableForceRender() {
	return useTableData((state) => state.forceRender);
}
export function useForceRender() {
	return useTableData((state) => state.forceRender);
}
export function useBlock() {
	return useTableData((state) => state.block);
}
export function useTable() {
	return useTableData((state) => state.table);
}
