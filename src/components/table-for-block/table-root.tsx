import { memo, useLayoutEffect, useRef, type PropsWithChildren } from "react";

import {
	TableDataProvider,
	type TableDataType,
} from "#/components/table-for-block/table-data-context";
import {
	useBlockAndFilters,
	useSetTableData,
} from "#/components/table-for-block/table-data-context-utils";
import type { TableHelperStore } from "#/components/table-for-block/use-table-helper";
import { cn } from "#/lib/utils";
import type { BlockFilterAndSort } from "#/types/notebook";

type Props = {
	initialBlockFilterAndSort?: BlockFilterAndSort;
	allData: TableDataType["allData"];
	dataComesFromDataPreview: boolean;
	totalNumberOfRows: number | null;
	block?: TableDataType["block"];
	numberOfRowsPerPage: number;
	initialPageNumber: number;
	isFetchingData: boolean;
	isNewSource: boolean;
	canScroll?: boolean;
	className?: string;
	setNumberOfRowsPerPage?: TableDataType["setNumberOfRowsPerPage"];
	setBlockFilterAndSort?: TableDataType["setBlockFilterAndSort"];
	setIsNewSource?: TableDataType["setIsNewSource"];
	fetchMore?: TableHelperStore["paginate"];
	reload?: TableDataType["reload"];
};

function TableRoot_({
	dataComesFromDataPreview,
	numberOfRowsPerPage,
	totalNumberOfRows,
	initialPageNumber,
	canScroll = true,
	className = "",
	isFetchingData,
	isNewSource,
	children,
	allData,
	block,
	setNumberOfRowsPerPage,
	setBlockFilterAndSort,
	setIsNewSource,
	fetchMore,
	reload,
}: React.PropsWithChildren<Props>) {
	const blockFilterAndSort = useBlockAndFilters();
	const setTableData = useSetTableData();

	const tableWrapperRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		setTableData({
			dataComesFromDataPreview,
			numberOfRowsPerPage,
			totalNumberOfRows,
			initialPageNumber,
			tableWrapperRef,
			isFetchingData,
			isNewSource,
			canScroll,
			allData,
			block,
			setNumberOfRowsPerPage,
			setIsNewSource,
			fetchMore,
			reload,
		});
	}, [
		dataComesFromDataPreview,
		numberOfRowsPerPage,
		totalNumberOfRows,
		initialPageNumber,
		isFetchingData,
		isNewSource,
		canScroll,
		allData,
		block,
		setNumberOfRowsPerPage,
		setIsNewSource,
		setTableData,
		fetchMore,
		reload,
	]);

	useLayoutEffect(() => {
		setBlockFilterAndSort?.(blockFilterAndSort);
	}, [blockFilterAndSort, setBlockFilterAndSort]);

	return (
		<div
			className={cn(
				"relative box-border flex min-h-[118px] w-full flex-col overflow-hidden whitespace-nowrap text-xs leading-7 [&_svg]:text-primary",
				className,
			)}
			ref={tableWrapperRef}
		>
			{children}

			<div className="table-linear-gradient h-110 absolute inset-0 bottom-0 z-1 hidden w-full after:to-black/5 after:from-black/50 after:from-90% after:absolute after:inset-0 after:z-50 after:pointer-events-none after:bg-linear-to-t"></div>
		</div>
	);
}

export const MemoTableRoot = memo(function TableRoot(
	props: PropsWithChildren<Props>,
) {
	return (
		<TableDataProvider
			initialBlockFilterAndSort={props.initialBlockFilterAndSort}
		>
			<TableRoot_ {...props} />
		</TableDataProvider>
	);
});
