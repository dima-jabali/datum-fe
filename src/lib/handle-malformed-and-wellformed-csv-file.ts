import type { TableDataForReducer } from "#/components/table-for-block/use-table-helper";
import { type Options, parse } from "csv-parse/sync";
import { toast } from "sonner";

function isValidValue(value: unknown) {
	return (
		(Boolean(value) && typeof value === "string") || typeof value === "number"
	);
}

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
	skipEmptyLines: false,
	relaxQuotes: true,
} as const;

export async function handleMalformedAndWellformedCSVFile({
	isParsedByTheBackend = false,
	totalNumberOfRows = null,
	alreadyParsedData,
	blockUuid,
	file,
	putNewDataInTableFromNewSource,
}: {
	totalNumberOfRows: number | null;
	isParsedByTheBackend?: boolean;
	alreadyParsedData?: unknown[];
	blockUuid: string;
	file?: File;
	putNewDataInTableFromNewSource: (
		newData: TableDataForReducer,
		totalNumberOfRows: number | null,
	) => void;
}): Promise<void> {
	const parsedData = await (async (): Promise<unknown[] | undefined> => {
		if (alreadyParsedData) return alreadyParsedData;

		if (!file) {
			console.log("handleMalformedAndWellformedCSVFile: no file", {
				isParsedByTheBackend,
				totalNumberOfRows,
				alreadyParsedData,
				blockUuid,
				file,
			});

			return;
		}

		return parse(await file.text(), PARSE_CSV_OPTIONS);
	})();

	if (!parsedData) {
		console.error("No data", {
			totalNumberOfRows,
			parsedData,
			blockUuid,
			file,
		});

		toast.error("Invalid CSV file");

		return;
	}

	console.time("handleMalformedAndWellformedCSVFile");

	// Let's assume the data is an array of objects or an array of arrays.
	const isArrayOfArrays = Array.isArray(parsedData[0]);

	type Obj = Record<string, string | number>;
	type Headers = Obj[] | string[];

	const usefulData = {
		rows: [] as Obj[] | (string | number)[],
		headers: [] as Headers,
	};

	if (isArrayOfArrays) {
		// Let's try and get the headers:

		// Since data is an array of arrays, the first row is a candidate for the headers.
		outer: for (let i = 0; i < parsedData.length; ++i) {
			const headers = parsedData[i] as string[];

			// Let's check if the headers are of type string and if any of them are empty.
			for (const header of headers) {
				if (!isValidValue(header)) {
					// If the header is empty, likely this row is garbage.
					// Let's try for the next row.
					continue outer;
				}
			}

			// If we made it here, all headers are alright and it means that the data
			// comes from a CSV file all at once, so the formatter in this function
			// is the only time that we need to create objects (the useTableHelper hook
			// doesn't need to do it on their side as they need to when the data comes
			// from the backend).
			parsedData.splice(0, i + 1);
			usefulData.rows = parsedData as string[];
			usefulData.headers = headers as string[];

			break outer;
		}
	} else {
		// Let's try and get the headers:

		// Since data is an array of objects, the first row's keys and values
		// are a candidate for the headers.
		outer: for (let i = 0; i < parsedData.length; ++i) {
			// Let's try the keys:
			let valuesAreGoodToGo = true;
			let keysAreGoodToGo = true;

			if (!isParsedByTheBackend) {
				for (const key in (parsedData as Obj[])[i]) {
					const value = (parsedData as Obj[])[i]![key];

					if (!isValidValue(key)) {
						// If the header is empty, likely the keys
						// are garbage. Let's try getting the values, then.
						keysAreGoodToGo = false;

						break;
					}

					// Let's see if the values work:
					if (!isValidValue(value)) {
						// If the header or is empty, likely the values are garbage.
						//  So, if keys also haven't worked, let's repeat the
						//  process with the next row until we get one that works.
						valuesAreGoodToGo = false;

						break;
					}
				}
			}

			if (!keysAreGoodToGo && !valuesAreGoodToGo) {
				continue;
			}

			if (valuesAreGoodToGo && keysAreGoodToGo) {
				// If both keys and values are good, it means that all the data is good.
				usefulData.headers = Object.keys((parsedData as Obj[])[i] || {});
				usefulData.rows = parsedData as Obj[];

				break outer;
			} else if (valuesAreGoodToGo) {
				// If only the values or the keys are good, we get them as headers and
				// the rows will be the rest of the data:
				usefulData.headers = Object.values(
					(parsedData as Obj[])[i] || {},
				) as string[];
				usefulData.rows = parsedData.slice(i + 1) as Obj[];

				break outer;
			} else {
				// if (keysAreGoodToGo)

				// If only the keys or the keys are good, we get them as headers and
				// the rows will be the rest of the data:
				usefulData.headers = Object.keys((parsedData as Obj[])[i] || {});
				usefulData.rows = parsedData.slice(i + 1) as Obj[];

				break outer;
			}
		}
	}

	// Make new objects with the correct headers as keys:
	const formatted: Obj[] = [];

	usefulData.rows.forEach((row) => {
		let numberOfHeaders = 0;
		const obj: Obj = {};

		if (Array.isArray(row)) {
			row.forEach((item: string | number, index: number) => {
				obj[(usefulData.headers as string[])[index]!] = item;

				++numberOfHeaders;
			});
		} else if (typeof row === "object" && row) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Object.values(row).forEach((item: any, index: number) => {
				obj[(usefulData.headers as string[])[index]!] = item;

				++numberOfHeaders;
			});
		}

		// If any of the rows is not complete, ignore it:
		if (numberOfHeaders === usefulData.headers.length) {
			formatted.push(obj);
		}
	});

	const actualTotalNumberOfRows = Number.isFinite(totalNumberOfRows)
		? totalNumberOfRows
		: formatted.length;

	putNewDataInTableFromNewSource(formatted, actualTotalNumberOfRows);

	console.timeEnd("handleMalformedAndWellformedCSVFile");
}
