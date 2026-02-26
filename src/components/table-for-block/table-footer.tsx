import {
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	ClipboardIcon,
	Download,
	X,
} from "lucide-react";
import { AxiosError } from "axios";
import {
	memo,
	useId,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";

import { BlockType } from "#/types/notebook";
import { LOADER } from "#/components/loader";
import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import {
	useImmediateTableData,
	useSetTableData,
	useTableData,
} from "#/components/table-for-block/table-data-context-utils";
import { convertArrayOfObjectsToCSV, hidePopover, noop } from "#/lib/utils";
import {
	DATA_ID_KEY,
	HEADER_AND_FOOTER_HEIGHT,
	TABLE_CELL_MIN_HEIGHT,
} from "#/components/table-for-block/utils";
import { useDownloadCsv } from "#/hooks/mutation/use-download-csv";
import { useDownloadSql } from "#/hooks/mutation/use-download-sql";
import { areFiltersEqual } from "#/components/table-for-block/filters/filters";

const FIRST_PAGE = 1;

export const MemoDefaultTableFooter = memo(function DefaultTableFooter() {
	const setTableData = useSetTableData();
	const {
		dataComesFromDataPreview,
		numberOfRowsPerPage,
		blockFilterAndSort,
		totalNumberOfRows,
		initialPageNumber,
		tableWrapperRef,
		groupOfFilters,
		isFetchingData,
		isSortingData,
		isNewSource,
		currPage,
		setNumberOfRowsPerPage,
		setIsNewSource,
		fetchMore,
	} = useTableData((state) => ({
		dataComesFromDataPreview: state.dataComesFromDataPreview,
		numberOfRowsPerPage: state.numberOfRowsPerPage,
		blockFilterAndSort: state.blockFilterAndSort,
		totalNumberOfRows: state.totalNumberOfRows,
		initialPageNumber: state.initialPageNumber,
		tableWrapperRef: state.tableWrapperRef,
		groupOfFilters: state.groupOfFilters,
		isFetchingData: state.isFetchingData,
		isSortingData: state.isSortingData,
		isNewSource: state.isNewSource,
		currPage: state.currPage,
		setNumberOfRowsPerPage: state.setNumberOfRowsPerPage,
		setIsNewSource: state.setIsNewSource,
		fetchMore: state.fetchMore,
	}));

	const prevFiltersToSendToServerRef = useRef(blockFilterAndSort);

	const totalPageCount =
		Math.ceil((totalNumberOfRows ?? 0) / numberOfRowsPerPage) || 1;

	const isGoToNextPageDisabled =
		currPage >= totalPageCount || isFetchingData || isSortingData;
	const isGoToLastPageDisabled =
		currPage >= totalPageCount || isFetchingData || isSortingData;
	const isGoToPreviousPageDisabled =
		currPage <= 1 || isFetchingData || isSortingData;
	const isGoToFirstPageDisabled =
		currPage <= 1 || isFetchingData || isSortingData;

	const isAnythingLoading = isFetchingData;

	function goToFirstPage() {
		if (isGoToFirstPageDisabled) return;

		const startIndex = 0;
		const endIndex = numberOfRowsPerPage;

		fetchMore?.({
			filters: blockFilterAndSort,
			startIndex,
			endIndex,
			onComplete: () => setTableData({ currPage: FIRST_PAGE }),
			onFetchFinish: noop,
		}).catch(noop);
	}

	function goToPreviousPage() {
		if (isGoToPreviousPageDisabled) return;

		const prevPage = currPage - 1;
		const startIndex = prevPage * numberOfRowsPerPage;
		const endIndex = prevPage * numberOfRowsPerPage - numberOfRowsPerPage;

		fetchMore?.({
			filters: blockFilterAndSort,
			startIndex,
			endIndex,
			onComplete: () => setTableData({ currPage: prevPage }),
			onFetchFinish: noop,
		}).catch(noop);
	}

	function goToNextPage() {
		if (isGoToNextPageDisabled) return;

		const nextPage = currPage + 1;
		const startIndex = nextPage * numberOfRowsPerPage - numberOfRowsPerPage;
		const endIndex = nextPage * numberOfRowsPerPage;

		fetchMore?.({
			filters: blockFilterAndSort,
			startIndex,
			endIndex,
			onComplete: () => setTableData({ currPage: nextPage }),
			onFetchFinish: noop,
		}).catch(noop);
	}

	function goToLastPage() {
		if (isGoToLastPageDisabled || !totalNumberOfRows) return;

		const startIndex = totalNumberOfRows - numberOfRowsPerPage;
		const endIndex = totalNumberOfRows - 1;

		fetchMore?.({
			filters: blockFilterAndSort,
			startIndex,
			endIndex,
			onComplete: () => setTableData({ currPage: totalPageCount }),
			onFetchFinish: noop,
		}).catch(noop);
	}

	/** On resize height of table, recalculate number of rows per page. */
	useLayoutEffect(() => {
		const handleResizeStop = async () => {
			const newHeightOfTableWrapper = tableWrapperRef?.current?.clientHeight;

			if (newHeightOfTableWrapper === undefined) return;

			// The extra `4` is to account for borders:
			const newUsefulHeight =
				newHeightOfTableWrapper -
				2 * HEADER_AND_FOOTER_HEIGHT -
				4 -
				TABLE_CELL_MIN_HEIGHT; /* Header row */

			const newNumberOfRowsPerPage =
				Math.floor(newUsefulHeight / TABLE_CELL_MIN_HEIGHT) - 1;

			const endIndex = newNumberOfRowsPerPage;
			const startIndex = 0;

			setNumberOfRowsPerPage?.(newNumberOfRowsPerPage);

			fetchMore?.({
				filters: blockFilterAndSort,
				startIndex,
				endIndex,
				onFetchFinish: () => setTableData({ currPage: FIRST_PAGE }),
				onComplete: noop,
			}).catch(noop);
		};

		setTableData({ handleResizeStop });
	}, [
		blockFilterAndSort,
		tableWrapperRef,
		groupOfFilters,
		currPage,
		setNumberOfRowsPerPage,
		setTableData,
		fetchMore,
	]);

	/** Fetch with new filters when they change. */
	useLayoutEffect(() => {
		const prev = prevFiltersToSendToServerRef.current;
		const curr = blockFilterAndSort;

		if (areFiltersEqual(prev, curr)) return;

		prevFiltersToSendToServerRef.current = blockFilterAndSort;

		if (fetchMore) {
			setTableData({ isSortingData: true });
			setIsNewSource?.(true);

			fetchMore({
				endIndex: numberOfRowsPerPage,
				filters: blockFilterAndSort,
				startIndex: 0,
				onComplete: () => setTableData({ isSortingData: false }),
				onFetchFinish: noop,
			}).catch(noop);
		}
	}, [
		numberOfRowsPerPage,
		blockFilterAndSort,
		setIsNewSource,
		setTableData,
		fetchMore,
	]);

	/** Handle when the source is new. */
	useLayoutEffect(() => {
		if (isNewSource && setIsNewSource) {
			setIsNewSource(false);

			setTableData({
				currPage: dataComesFromDataPreview ? initialPageNumber : FIRST_PAGE,
			});
		}
	}, [
		dataComesFromDataPreview,
		initialPageNumber,
		isNewSource,
		setIsNewSource,
		setTableData,
	]);

	return (
		<footer className="flex h-9 mobile:h-11 simple-scrollbar overflow-y-hidden w-full items-center justify-between border-t border-border-smooth tracking-wide [&_svg]:size-4 text-muted-foreground stroke-muted-foreground">
			<section className="flex h-9 items-center justify-center gap-1 px-1">
				<div className="flex items-center justify-start">
					<button
						className="button-hover flex items-center justify-center rounded-sm p-[3px] text-xs"
						aria-disabled={isGoToFirstPageDisabled || isAnythingLoading}
						title="Go to first page"
						onClick={goToFirstPage}
					>
						<ChevronsLeftIcon className="stroke-muted-foreground stroke-1" />
					</button>

					<button
						className="button-hover flex items-center justify-center rounded-sm p-[3px] text-xs"
						aria-disabled={isGoToPreviousPageDisabled || isAnythingLoading}
						title="Go to previous page"
						onClick={goToPreviousPage}
					>
						<ChevronLeftIcon className="stroke-muted-foreground stroke-1" />
					</button>

					<span className="px-2 text-xs  leading-[30px]">
						Page&nbsp;{currPage}&nbsp;of&nbsp;
						{totalPageCount}
					</span>

					<button
						className="button-hover flex items-center justify-center rounded-sm p-[3px] text-xs"
						aria-disabled={isGoToNextPageDisabled || isAnythingLoading}
						title="Go to next page"
						onClick={goToNextPage}
					>
						<ChevronRightIcon className="stroke-muted-foreground stroke-1" />
					</button>

					<button
						className="button-hover flex items-center justify-center rounded-sm p-[3px] text-xs"
						aria-disabled={isGoToLastPageDisabled || isAnythingLoading}
						title="Go to last page"
						onClick={goToLastPage}
					>
						<ChevronsRightIcon className="stroke-muted-foreground stroke-1" />
					</button>
				</div>

				<div className="mx-5 h-[70%] w-[1px] bg-border-smooth"></div>
			</section>

			<section className="flex h-9 items-center justify-center gap-1 px-1">
				<div className="flex aspect-square size-7 items-center justify-center">
					{isAnythingLoading ? LOADER : null}
				</div>

				<ViewPopover />

				<CopyTableButton />

				<DownloadAsCSVButton />

				{Number.isFinite(totalNumberOfRows) ? (
					<span className="px-2 text-xs leading-[30px]">
						{totalNumberOfRows} rows
					</span>
				) : null}
			</section>
		</footer>
	);
});

function DownloadAsCSVButton() {
	const [isDownloading, setIsDownloading] = useState(false);

	const [wasDownloadedSuccessfully, setWasDownloadedSuccessfully] = useReducer(
		(_prev: boolean | null, next: boolean | null): boolean | null => {
			if (next !== null) {
				setTimeout(() => {
					setWasDownloadedSuccessfully(null);
				}, 2_000);
			}

			return next;
		},
		null,
	);

	const { getState: getTableData, setState: setTableData } =
		useImmediateTableData();
	const downloadCsv = useDownloadCsv();
	const downloadSql = useDownloadSql();

	async function handleDownloadAsCSV() {
		if (isDownloading) return;

		const { blockFilterAndSort, block } = getTableData();

		if (!block?.uuid) {
			console.error("Uuid is undefined", { block });

			toast.error("Can't download file", {
				description:
					"This block has no uuid. This should not happen! Try refreshing the page!",
			});

			return;
		}

		const variable_name =
			block.write_variables?.[0]?.name || block.write_variables;

		if (!variable_name) {
			console.error("Can't download table. No variable name.", { block });

			toast.error("Download failed", {
				description: "No variable name.",
			});

			return;
		}

		try {
			setTableData({ isFetchingData: true });
			setIsDownloading(true);

			const blockType = block.type.toLowerCase();

			const reponse =
				blockType === BlockType.Table.toLowerCase() ||
				blockType === BlockType.Csv.toLowerCase()
					? await downloadCsv.mutateAsync({
							action_info: {
								filters: blockFilterAndSort,
							},
							blockUuid: block.uuid,
						})
					: await downloadSql.mutateAsync({
							action_info: {
								filters: blockFilterAndSort,
							},
							blockUuid: block.uuid,
						});

			const url = URL.createObjectURL(await reponse.blob());

			const a = document.createElement("a");
			a.download = `${variable_name}.csv`;
			a.href = url;

			document.body.appendChild(a);

			a.click();

			// clean up "a" element & remove ObjectURL
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			setWasDownloadedSuccessfully(true);
		} catch (error) {
			console.error(error);

			setWasDownloadedSuccessfully(false);

			if (error instanceof AxiosError) {
				const description =
					error.response?.data.error ||
					"An error occurred while trying to download the file.";

				toast.error("Download failed", {
					description,
				});
			}
		} finally {
			setTableData({ isFetchingData: false });
			setIsDownloading(false);
		}
	}

	return (
		<button
			className="button-hover flex h-[21px] items-center justify-center rounded-sm p-2.5 text-xs text-muted-foreground"
			onClick={handleDownloadAsCSV}
			title={
				wasDownloadedSuccessfully === true
					? "Success downloading as CSV"
					: wasDownloadedSuccessfully === false
						? "Failed downloading as CSV"
						: isDownloading
							? "Downloading as CSV…"
							: "Download as CSV"
			}
		>
			{isDownloading ? (
				LOADER
			) : wasDownloadedSuccessfully === true ? (
				<CheckIcon className="size-5 stroke-positive stroke-1" />
			) : wasDownloadedSuccessfully === false ? (
				<X className="size-5 stroke-destructive stroke-1" />
			) : (
				<Download className="size-5 stroke-muted-foreground stroke-1" />
			)}
		</button>
	);
}

function CopyTableButton() {
	const [isCopying, setIsCopying] = useState(false);

	const [wasCopiedSuccessfully, setWasCopiedSuccessfully] = useReducer(
		(_prev: boolean | null, next: boolean | null): boolean | null => {
			if (next !== null) {
				setTimeout(() => {
					setWasCopiedSuccessfully(null);
				}, 2_000);
			}

			return next;
		},
		null,
	);

	const { getState: getTableData, setState: setTableData } =
		useImmediateTableData();
	const downloadCsv = useDownloadCsv();
	const downloadSql = useDownloadSql();

	const popoverId = useId();

	async function handleCopyTable() {
		hidePopover(popoverId);

		if (isCopying) return;

		const { block, blockFilterAndSort } = getTableData();

		if (!block?.uuid) {
			console.error("Block uuid is undefined", { block });

			return;
		}

		const variable_name =
			block?.write_variables?.[0]?.name || block?.write_variables;

		if (!variable_name) {
			console.error("Can't copy table. No variable name.", { block });

			toast.error("Copy failed", {
				description: "No variable name.",
			});

			return;
		}

		try {
			setTableData({ isFetchingData: true });
			setIsCopying(true);

			const blockType = block.type.toLowerCase();

			const response =
				blockType === BlockType.Table.toLowerCase() ||
				blockType === BlockType.Csv.toLowerCase()
					? await downloadCsv.mutateAsync({
							action_info: {
								filters: blockFilterAndSort,
							},
							blockUuid: block.uuid,
						})
					: await downloadSql.mutateAsync({
							action_info: {
								filters: blockFilterAndSort,
							},
							blockUuid: block.uuid,
						});

			try {
				await navigator.clipboard.writeText(await response.text());
			} catch (error) {
				console.log("Failed to copy text to clipboard", error);

				// In case it is a window focus error, write to clipboard on next window focus:
				function writeToClipboardOnWindowFocus() {
					return new Promise<void>((resolve, reject) => {
						const _asyncCopyFn = async () => {
							try {
								await navigator.clipboard.writeText(await response.text());

								resolve();
							} catch (e) {
								reject(e);
							}
						};

						window.addEventListener("focus", _asyncCopyFn, { once: true });
					});
				}

				await writeToClipboardOnWindowFocus();
			}

			setWasCopiedSuccessfully(true);
		} catch (error) {
			setWasCopiedSuccessfully(false);

			console.error(error);

			if (error instanceof AxiosError) {
				const description =
					error.response?.data.error ||
					"An error occurred while trying to download the file.";

				toast.error("Download failed", {
					description,
				});
			}
		} finally {
			setTableData({ isFetchingData: false });
			setIsCopying(false);
		}
	}

	async function handleCopyPage() {
		hidePopover(popoverId);

		if (isCopying) return;

		const { currPage, numberOfRowsPerPage, allData } = getTableData();
		const pageData = [];

		const initialRowIndex = (currPage - 1) * numberOfRowsPerPage;
		const lastRowIndex = initialRowIndex + numberOfRowsPerPage;

		for (const [rowIndex, row] of allData) {
			if (rowIndex < initialRowIndex) {
				continue;
			} else if (rowIndex > lastRowIndex) {
				break;
			}

			const { [DATA_ID_KEY]: _ignore, ...originalData } = row;

			pageData.push(originalData);
		}

		const dataAsCSV = convertArrayOfObjectsToCSV(pageData);

		try {
			await navigator.clipboard.writeText(dataAsCSV);

			setWasCopiedSuccessfully(true);
		} catch {
			setWasCopiedSuccessfully(false);
		}
	}

	return (
		<NativePopover id={popoverId}>
			<NativePopoverTrigger
				className="flex h-[21px] items-center justify-center rounded-sm px-2.5 disabled:pointer-events-none button-hover"
				disabled={isCopying}
				title={
					wasCopiedSuccessfully === true
						? "Success copying table or page"
						: wasCopiedSuccessfully === false
							? "Failed copying table or page"
							: isCopying
								? "Copying table or page…"
								: "Copy table or page"
				}
			>
				{isCopying ? (
					LOADER
				) : wasCopiedSuccessfully === true ? (
					<CheckIcon className="size-5 stroke-positive stroke-1" />
				) : wasCopiedSuccessfully === false ? (
					<X className="size-5 stroke-destructive stroke-1" />
				) : (
					<ClipboardIcon className="size-5 stroke-muted-foreground stroke-1" />
				)}
			</NativePopoverTrigger>

			<NativePopoverContent position="top">
				<button
					className="flex items-center justify-start rounded-sm p-2 text-sm button-hover"
					onClick={handleCopyTable}
				>
					Copy table
				</button>

				<button
					className="flex items-center justify-start rounded-sm p-2 text-sm button-hover"
					onClick={handleCopyPage}
				>
					Copy page
				</button>
			</NativePopoverContent>
		</NativePopover>
	);
}

function ViewPopover() {
	const setTableData = useSetTableData();
	const {
		numberOfRowsPerPage,
		blockFilterAndSort,
		table,
		setNumberOfRowsPerPage,
		fetchMore,
	} = useTableData((store) => ({
		numberOfRowsPerPage: store.numberOfRowsPerPage,
		blockFilterAndSort: store.blockFilterAndSort,
		table: store.table,
		setNumberOfRowsPerPage: store.setNumberOfRowsPerPage,
		fetchMore: store.fetchMore,
	}));

	const [newNumberOfRows, setNewNumberOfRows] = useState(numberOfRowsPerPage);

	function onOpenChange(newState: boolean) {
		const isClosing = newState === false;

		if (isClosing) {
			const shouldChangeValue =
				numberOfRowsPerPage !== newNumberOfRows &&
				Number.isFinite(newNumberOfRows);

			if (shouldChangeValue) {
				fetchMore?.({
					filters: blockFilterAndSort,
					endIndex: newNumberOfRows,
					startIndex: 0,
					onFetchFinish: noop,
					onComplete: noop,
				}).catch(noop);

				setNumberOfRowsPerPage?.(newNumberOfRows);
				table?.setPageSize(newNumberOfRows);
				setTableData({ currPage: 1 });
			}
		}
	}

	return (
		<NativePopover onOpenChange={onOpenChange}>
			<NativePopoverTrigger
				className="flex h-[21px] items-center justify-center rounded-sm px-2.5 disabled:pointer-events-none button-hover"
				title="Change view options"
			>
				View
			</NativePopoverTrigger>

			<NativePopoverContent position="top">
				<section className="flex items-center justify-center gap-2 px-1">
					<span>Rows per page:</span>

					<input
						onChange={(e) =>
							setNewNumberOfRows(Math.max(e.target.valueAsNumber, 1))
						}
						className="w-10 bg-popover outline-hidden"
						defaultValue={numberOfRowsPerPage}
						type="number"
						min={1}
					/>
				</section>
			</NativePopoverContent>
		</NativePopover>
	);
}
