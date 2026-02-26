import { isEqual } from "es-toolkit";
import { useRef, useState } from "react";
import { createStore, useStore } from "zustand";
import { toast } from "sonner";

import type { BlockFilterAndSort, NotebookBlockUuid } from "#/types/notebook";
import { DEFAULT_FILTERS } from "#/components/table-for-block/filters/filters";
import type {
	DataForTable,
	TableDataType,
} from "#/components/table-for-block/table-data-context";
import { DATA_ID_KEY } from "#/components/table-for-block/utils";
import { usePaginateDataframe } from "#/hooks/mutation/use-paginate-dataframe";

export type TableDataForReducer = { [key: string]: string | number }[];

export type TableDataArrayItem = [number, DataForTable];
export type TableDataAsArray = TableDataArrayItem[];

export type TableHelperStore = {
	tableMapStorage: TableDataType["allData"];
	tableArrayStorage: TableDataAsArray;
	dataComesFromDataPreview: boolean;
	totalNumberOfRows: number | null;
	numberOfRowsPerPage: number;
	isFetchingData: boolean;
	isNewSource: boolean;
	initialPage: number;

	// Actions:
	setTableArrayStorage: (rawNextStateForReducer: TableDataForReducer) => void;
	setIsNewSource: (next: boolean) => void;
	putSavedDataInTheTable: (
		tableMapStorageAsArray: TableDataAsArray,
		totalNumberOfRows: number | null,
		initialPage: number,
	) => void;
	putNewDataInTableFromNewSource: (
		newData: TableDataForReducer,
		totalNumberOfRows: number | null,
	) => void;
	paginate: (props: {
		filters?: BlockFilterAndSort;
		startIndex: number;
		endIndex: number;
		onFetchFinish: () => void;
		onComplete: () => void;
	}) => Promise<void>;
	setNumberOfRowsPerPage: (next: number) => void;
	setIsFetchingData: (next: boolean) => void;
};

const hasItemsWithIdsBetween = (
	map: TableDataType["allData"],
	startIndexAndId: number,
	endIndexAndId: number,
	totalNumberOfRows: number,
): boolean => {
	if (endIndexAndId > totalNumberOfRows - 1) {
		endIndexAndId = totalNumberOfRows - 1;
	}

	for (let key = startIndexAndId; key < endIndexAndId; ++key) {
		const value = map.get(key);

		if (!value) {
			return false;
		}
	}

	return true;
};

function showPaginateErrorToast() {
	toast.error("Error paginating data", {
		description: "We've let our engineers know.",
	});
}

export function useTableHelper(
	currentBlockUUID: NotebookBlockUuid,
	initialNumberOfRowsPerPage: number,
) {
	const prevBlockFilterAndSortRef = useRef<BlockFilterAndSort>(undefined);
	const headersRef = useRef<Array<string | number>>([]);
	const tableStartIndexRef = useRef(0);

	const paginateDataframe = usePaginateDataframe();

	const [store] = useState(() => {
		const store = createStore<TableHelperStore>((set, get) => ({
			numberOfRowsPerPage:
				initialNumberOfRowsPerPage > 1 ? initialNumberOfRowsPerPage : 10,
			dataComesFromDataPreview: false,
			tableMapStorage: new Map(),
			totalNumberOfRows: null,
			isFetchingData: false,
			tableArrayStorage: [],
			isNewSource: false,
			initialPage: 1,

			// Actions:
			setIsNewSource: (next: boolean) => {
				const prev = get().isNewSource;
				const isChangingToTrue = !prev && next;

				if (isChangingToTrue) {
					set({ tableMapStorage: new Map() });
					tableStartIndexRef.current = 0;
					headersRef.current = [];
				}

				set({ isNewSource: next });
			},

			setTableArrayStorage: (rawNextStateForReducer: TableDataForReducer) => {
				let indexAndId = tableStartIndexRef.current;

				const dataToAdd: DataForTable[] = [];

				// Prepare data for table:
				for (const item of rawNextStateForReducer) {
					if (!item || typeof item === "string") {
						console.log("item is not an object", { item });

						continue;
					}

					if (Array.isArray(item)) {
						// If the item is an array, it's because it's one of the previous items which are of type TableDataAsArray, so we should skip it.
						if (item[1][DATA_ID_KEY] === undefined) {
							console.log(
								"item is not an object with type TableDataAsArray. This function is not equiped to handle arrays.",
								{ item },
							);
						}

						continue;
					} else if (headersRef.current.length === 0) {
						// This is the first page. If we're receiving data from a CSV
						// file, we need to get the header and save it locally because
						// if the data is from pagination, the next pages won't have the
						// correct headers if the file is originally malformed.
						headersRef.current = Object.keys(item);
					}

					if (item[DATA_ID_KEY] === undefined) {
						const newItem = {} as DataForTable;

						let numberOfHeadersSet = 0;
						let index = 0;

						for (const key in item) {
							const value = item[key];

							if (value === undefined) continue;

							const header = headersRef.current[index];

							if (header === undefined) continue;

							newItem[header] = value;

							++numberOfHeadersSet;
							++index;
						}

						if (numberOfHeadersSet < headersRef.current.length - 1) {
							console.log(
								"This item has less values than the headers. Therefore, it won't be added to the table.",
								{ item, newItem },
							);

							const prevTotalNumberOfRows = get().totalNumberOfRows;
							set({
								totalNumberOfRows:
									prevTotalNumberOfRows === null
										? prevTotalNumberOfRows
										: prevTotalNumberOfRows - 1,
							});
						} else {
							newItem[DATA_ID_KEY] = indexAndId;

							dataToAdd.push(newItem);
						}

						++indexAndId;
					} else {
						dataToAdd.push(item as DataForTable);
					}
				}

				const nextTableMapStorage = new Map(get().tableMapStorage);

				dataToAdd.forEach((item) => {
					nextTableMapStorage.set(item[DATA_ID_KEY], item);
				});

				set({
					tableArrayStorage: [...nextTableMapStorage],
					tableMapStorage: nextTableMapStorage,
				});
			},

			paginate: async ({
				filters = DEFAULT_FILTERS,
				startIndex,
				endIndex,
				onFetchFinish,
				onComplete,
			}) => {
				const {
					totalNumberOfRows,
					tableArrayStorage,
					tableMapStorage,
					isFetchingData,
					setTableArrayStorage,
				} = get();

				if (isFetchingData) return;

				if (totalNumberOfRows === null) {
					console.error("`totalNumberOfRows` is null");

					return;
				}

				const haveFiltersChanged = !isEqual(
					prevBlockFilterAndSortRef.current,
					filters,
				);

				prevBlockFilterAndSortRef.current = filters;

				const greater = Math.max(startIndex, endIndex);
				const smaller = Math.min(startIndex, endIndex);

				const numberOfRowsPerPage = greater - smaller;

				const needToFetch =
					haveFiltersChanged || // If the filters changed, fetch anyway.
					tableArrayStorage.length === 0 ||
					!hasItemsWithIdsBetween(
						tableMapStorage,
						smaller,
						greater,
						totalNumberOfRows,
					);

				try {
					if (!needToFetch) return;

					set({ isFetchingData: true });

					const res = await paginateDataframe.mutateAsync({
						blockUuid: currentBlockUUID,
						action_info: {
							limit: numberOfRowsPerPage,
							offset: smaller,
							filters,
						},
					});

					onFetchFinish();

					if (res.action_output.error === "") {
						tableStartIndexRef.current = smaller;

						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						let jsonData: any[] = [];

						if (typeof res.action_output.data === "string") {
							try {
								jsonData = JSON.parse(res.action_output.data);
							} catch (error) {
								console.warn(error, { res });
							}
						} else if (Array.isArray(res.action_output.data)) {
							jsonData = res.action_output.data;
						}

						set({ totalNumberOfRows: res.action_output.num_rows });
						setTableArrayStorage(
							haveFiltersChanged
								? jsonData
								: jsonData.concat(tableArrayStorage),
						);
					} else {
						console.error(res.action_output.error);

						set({ totalNumberOfRows: null });
						tableStartIndexRef.current = 0;

						showPaginateErrorToast();
					}
				} catch (error) {
					console.error("Axios error paginating table data:", error);

					set({ totalNumberOfRows: null });
					tableStartIndexRef.current = 0;

					showPaginateErrorToast();
				} finally {
					set({ isFetchingData: false, dataComesFromDataPreview: false });
					onComplete();
				}
			},

			putNewDataInTableFromNewSource: (
				newData: TableDataForReducer,
				totalNumberOfRows: number | null,
			) => {
				get().setTableArrayStorage(newData);
				set({
					dataComesFromDataPreview: false,
					isNewSource: true,
					totalNumberOfRows,
				});
			},

			putSavedDataInTheTable: (
				tableMapStorageAsArray: TableDataAsArray,
				totalNumberOfRows: number | null,
				initialPage: number,
			) => {
				tableStartIndexRef.current =
					(initialPage - 1) * get().numberOfRowsPerPage;

				const tableDataForReducer: TableDataForReducer =
					tableMapStorageAsArray.map((item) => item[1]);

				get().setTableArrayStorage(tableDataForReducer);
				set({
					totalNumberOfRows: totalNumberOfRows,
					dataComesFromDataPreview: true,
					isNewSource: true,
					initialPage,
				});
			},

			setNumberOfRowsPerPage: (next: number) =>
				set({ numberOfRowsPerPage: next }),

			setIsFetchingData: (next: boolean) => set({ isFetchingData: next }),
		}));

		return store;
	});

	return useStore(store);
}
