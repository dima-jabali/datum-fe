/** biome-ignore-all lint/suspicious/noExplicitAny: ignore */

import {
	createColumnHelper,
	getCoreRowModel,
	getExpandedRowModel,
	getSortedRowModel,
	useReactTable,
	type CellContext,
} from "@tanstack/react-table";
import { type Options, parse } from "csv-parse/sync";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { Loader } from "lucide-react";

import { cn } from "#/lib/utils";
import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";
import { TanStackTable } from "#/components/tan-stack-table/tan-stack-table";
import type { AnyColumnDef } from "#/components/tan-stack-table/table-utils";

type Props = {
	enableColumnResizing?: boolean | undefined;
	className?: string | undefined;
	csv: string;
};

export type ParsedCsv = Array<Record<string, string | number>>;

const PARSE_CSV_OPTIONS: Options = {
	/** This function is needed to avoid failing to parse when encountering
	 * the value `"NaN"` (a NaN stringified).
	 */
	cast: (
		value: "true" | "false" | "NaN" | "" | ({} & string) | null | undefined,
	) => {
		if (value === "false") return false;
		if (value === "true") return true;

		if (!value) return " ";

		const tryAsNumber = Number(value);

		if (!Number.isNaN(tryAsNumber)) return tryAsNumber;

		return value;
	},
	skipRecordsWithError: false,
	relaxColumnCount: true,
	skipEmptyLines: true,
	relaxQuotes: true,
	columns: true,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_COLUMNS_AND_DATA: any[] = [];

function LinkCell({ url }: { url: string }) {
	return (
		<a
			className="link hover:underline"
			rel="noopener noreferrer"
			target="_blank"
			href={url}
		>
			{url}
		</a>
	);
}

function linkOrPlainTextCell(info: CellContext<unknown, unknown>) {
	const value = info.getValue();

	if (typeof value === "string") {
		const isUrl = value.startsWith("http");

		if (isUrl) {
			return <LinkCell url={value} />;
		}
	}

	return value;
}

function CsvToHtmlTable_({
	enableColumnResizing = true,
	className,
	csv,
}: Props) {
	const parseCsvQuery = useQuery({
		staleTime: Number.POSITIVE_INFINITY,
		queryKey: ["parse-csv", csv],
		throwOnError: true,
		async queryFn() {
			const promise = new Promise<{
				parsedCSVAsColumns: ParsedCsv;
				columns: Array<AnyColumnDef>;
			}>((resolve, reject) => {
				try {
					const parsedCSVAsColumns = parse(
						csv,
						PARSE_CSV_OPTIONS,
					) as unknown as ParsedCsv;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const columnHelper = createColumnHelper<any>();

					const headers = Object.keys(parsedCSVAsColumns[0] || {});
					const columns: Array<AnyColumnDef> = [];

					headers.forEach((header) => {
						const column = columnHelper.accessor(header, {
							cell: linkOrPlainTextCell,
							enableColumnFilter: true,
							enableGrouping: true,
							enableHiding: true,
							id: header,
							header,
						});

						columns.push(column);
					});

					resolve({ parsedCSVAsColumns, columns });
				} catch (error) {
					reject(error);
				}
			});

			const response = await promise;

			return response;
		},
	});

	const isParsed = !!parseCsvQuery.data;

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: isParsed
			? parseCsvQuery.data.parsedCSVAsColumns
			: DEFAULT_COLUMNS_AND_DATA,
		columns: isParsed ? parseCsvQuery.data.columns : DEFAULT_COLUMNS_AND_DATA,
		columnResizeMode: "onEnd",
		enableRowSelection: false,
		manualPagination: false,
		enableMultiSort: true,
		manualSorting: false,
		enableColumnResizing,
		enableSorting: true,
		debugAll: false,
		getExpandedRowModel: getExpandedRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getCoreRowModel: getCoreRowModel(),
	});

	return parseCsvQuery.isPending ? (
		<div className="flex gap-2 items-center text-xs">
			<Loader />

			<span>Parsing CSV...</span>
		</div>
	) : (
		<div
			className={cn(
				"rounded-lg overflow-hidden border border-border-smooth",
				className,
			)}
		>
			<TanStackTable table={table} canScroll />
		</div>
	);
}

export const CsvToHtmlTable = memo(function CsvToHtmlTable(
	props: Props & { withErrorBoundary?: boolean },
) {
	const { withErrorBoundary = true } = props;

	return withErrorBoundary ? (
		<DefaultSuspenseAndErrorBoundary
			failedText="Failed to parse CSV!"
			fallbackFor="CsvToHtmlTable"
		>
			<CsvToHtmlTable_ {...props} />
		</DefaultSuspenseAndErrorBoundary>
	) : (
		<CsvToHtmlTable_ {...props} />
	);
});
