import {
	flexRender,
	type Cell,
	type CellContext,
	type Column,
	type ColumnDef,
	type Header,
	type HeaderContext,
	type HeaderGroup,
	type Row,
	type Table,
	type TableOptions,
} from "@tanstack/react-table";

export type AnyHeaderContext = HeaderContext<any, unknown>;
export type AnyCellContext = CellContext<any, unknown>;
export type AnyTableOptions = TableOptions<any>;
export type AnyHeaderGroup = HeaderGroup<any>;
export type AnyHeader = Header<any, unknown>;
export type AnyColumnDef = ColumnDef<any>;
export type AnyCell = Cell<any, unknown>;
export type AnyColumn = Column<any>;
export type AnyTable = Table<any>;
export type AnyRow = Row<any>;

/** Measure dynamic row height, except in firefox because it measures table border height incorrectly */
export function measureDynamicRowHeight() {
	return typeof window !== "undefined" &&
		navigator.userAgent.indexOf("Firefox") === -1
		? (element: HTMLElement) => element?.getBoundingClientRect().height
		: undefined;
}

export function mapHeaderToCell(header: AnyHeader) {
	return flexRender(header.column.columnDef.header, header.getContext());
}

export function getRowId(row: { id: number | string }) {
	return `${row.id}`;
}
