import {
	flexRender,
	type Table as TanStackTableType,
} from "@tanstack/react-table";

import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";
import { SORT_ICONS } from "#/components/msg-icons";
import { DATA_ID_KEY } from "#/components/table-for-block/utils";
import { cn } from "#/lib/utils";

export function TanStackTable({
	canScroll,
	table,
}: {
	canScroll?: boolean | undefined;
	className?: string | undefined;
	table: TanStackTableType<any>;
}) {
	return (
		<DefaultSuspenseAndErrorBoundary
			failedText="Failed to render table!"
			fallbackFor="tan stack table"
			withLoader
		>
			{/* This wrapping div is needed to make only the table scrollable, not footer/header: */}
			<div
				className={
					canScroll
						? "simple-scrollbar flex h-full w-full max-w-full grow"
						: undefined
				}
			>
				<table
					className="overflow-auto text-sm whitespace-nowrap"
					style={{
						width: `${table.getTotalSize()}px`,
						...(canScroll
							? {
									minHeight: "117px",
									minWidth: "100%",
								}
							: null),
					}}
				>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const isResizing = header.column.getIsResizing();
									const canResize = header.column.getCanResize();
									const isLocalIndexColumn = Boolean(
										header.column.columnDef.meta &&
											"isLocalIndexColumn" in header.column.columnDef.meta,
									);

									return (
										<th
											className="data-[is-resizing=true]:pointer-events-none text-primary relative border border-t-0 first:border-l-0 last:border-r-0 border-border-smooth"
											style={{ width: `${header.getSize()}px` }}
											data-is-resizing={isResizing}
											colSpan={header.colSpan}
											key={header.id}
										>
											<button
												data-padding-right={!isLocalIndexColumn}
												disabled={isLocalIndexColumn}
												className={cn(
													"flex items-center h-full w-full gap-2 px-2 text-xs",
													isLocalIndexColumn
														? "text-primary justify-center"
														: "cursor-pointer button-hover text-primary",
												)}
												onClick={
													isLocalIndexColumn
														? undefined
														: header.column.getToggleSortingHandler()
												}
												title={`${header.column.columnDef.header}`}
												type="button"
											>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}

												{isLocalIndexColumn || !canResize
													? null
													: SORT_ICONS[
															header.column.getIsSorted() as keyof typeof SORT_ICONS
														]}
											</button>

											{isLocalIndexColumn || !canResize ? null : (
												<button
													style={{
														transform: isResizing
															? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
															: undefined,
													}}
													className="data-[is-resizing=true]:bg-blue-600 w-[5px] h-full cursor-col-resize opacity-0 absolute top-0 right-0 z-10 hover:opacity-100 bg-blue-300 active:opacity-100"
													onPointerDown={header.getResizeHandler()}
													data-is-resizing={isResizing}
													type="button"
												/>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>

					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr className="odd:bg-alt-row" key={row.id}>
								{row.getVisibleCells().map((cell) => {
									const renderValue = cell.renderValue();
									const jsx = flexRender(
										cell.column.columnDef.cell,
										cell.getContext(),
									);

									const hasNestedData =
										typeof renderValue === "object" && renderValue !== null;

									return (
										<td
											className="data-[is-index-column=true]:text-center px-2 border-x border-border-smooth first:border-l-0 last:border-r-0"
											data-is-index-column={
												cell.column.columnDef.id === DATA_ID_KEY
											}
											title={`${hasNestedData ? "Json Viewer" : renderValue}`}
											style={{ width: `${cell.column.getSize()}px` }}
											key={cell.id}
										>
											{hasNestedData
												? // <JsonViewer json={renderValue as object | any[]} />
													null
												: jsx}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</DefaultSuspenseAndErrorBoundary>
	);
}
