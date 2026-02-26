import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "react-error-boundary";
import { toast } from "sonner";

import { handleDataPreview } from "#/components/blocks/helpers";
import { Progress } from "#/components/progress/progress";
import { ProgressType } from "#/components/progress/utils";
import { DEFAULT_FILTERS } from "#/components/table-for-block/filters/filters";
import { Table } from "#/components/table-for-block/table";
import { useTableHelper } from "#/components/table-for-block/use-table-helper";
import { droppedFiles } from "#/contexts/dropped-files";
import { useIsStreaming } from "#/hooks/get/use-get-bot-conversation";
import { useIsRunningCsv, useRunCsv } from "#/hooks/mutation/use-run-csv";
import {
	useIsUploadingCsv,
	useUploadCsv,
} from "#/hooks/mutation/use-upload-csv";
import { handleMalformedAndWellformedCSVFile } from "#/lib/handle-malformed-and-wellformed-csv-file";
import {
	handleDragEnter,
	handleDragLeave,
	handleDragOver,
	isValidNumber,
	noop,
} from "#/lib/utils";
import type { BlockCsv } from "#/types/notebook";

export const CSVBlock = memo(function CSVBlock({
	csvBlock,
}: {
	csvBlock: BlockCsv;
}) {
	const [blockFilterAndSort, setBlockFilterAndSort] = useState(
		csvBlock.custom_block_info?.filters ?? DEFAULT_FILTERS,
	);

	const bytesParagraphRef = useRef<HTMLParagraphElement | null>(null);
	const progressRef = useRef<HTMLProgressElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const blockUuid = csvBlock.uuid;

	const isUploadingCsv = useIsUploadingCsv(blockUuid);
	const isRunningCsv = useIsRunningCsv(blockUuid);
	const uploadCsv = useUploadCsv(blockUuid);
	const isStreaming = useIsStreaming();
	const runCsv = useRunCsv(blockUuid);

	// console.log({
	// 	isUploadingCsv,
	// 	isRunningCsv,
	// 	uploadCsv,
	// 	runCsv
	// });

	const hasCsvFile = !!csvBlock.custom_block_info?.file_name;
	const doesBlockExistOnBackend = isValidNumber(csvBlock.id);

	useQuery({
		queryKey: ["handle-dropped-csv-file", blockUuid],
		staleTime: Number.POSITIVE_INFINITY,
		enabled: doesBlockExistOnBackend,
		async queryFn() {
			const droppedFile = droppedFiles.get(blockUuid);

			if (!droppedFile) {
				console.log("No dropped file found for csv.");

				return null;
			}

			try {
				await uploadCsv.mutateAsync({
					file: droppedFile.file,
					bytesParagraphRef,
					progressRef,
					blockUuid,
				});

				droppedFiles.delete(blockUuid); // remove dropped file since it has been uploaded

				await runCsv.mutateAsync({
					action_info: {
						filters: csvBlock.custom_block_info?.filters ?? DEFAULT_FILTERS,
						limit: 10,
						offset: 0,
					},
				});

				droppedFile.promiseToWaitForFileToBeUploaded?.resolve();
			} catch (error) {
				droppedFile.promiseToWaitForFileToBeUploaded?.reject();

				toast.error("Error initializing CSV block!", {
					description: getErrorMessage(error),
				});

				throw error;
			}

			return null;
		},
	});

	const isBlockRunning = isRunningCsv || isUploadingCsv;
	const dataPreview = csvBlock.custom_block_info?.data_preview;
	const dataPreviewLength =
		dataPreview && "data" in dataPreview && Array.isArray(dataPreview.data)
			? dataPreview.data.length
			: 10;

	const {
		dataComesFromDataPreview,
		numberOfRowsPerPage,
		totalNumberOfRows,
		tableMapStorage,
		isFetchingData,
		initialPage,
		isNewSource,
		putNewDataInTableFromNewSource,
		putSavedDataInTheTable,
		setNumberOfRowsPerPage,
		setIsNewSource,
		paginate,
	} = useTableHelper(blockUuid, dataPreviewLength);

	useEffect(() => {
		handleDataPreview({ dataPreview, putSavedDataInTheTable });
	}, [dataPreview, putSavedDataInTheTable]);

	async function handleRunCsv() {
		if (isBlockRunning) return;

		await runCsv
			.mutateAsync({
				action_info: {
					filters: blockFilterAndSort,
					limit: numberOfRowsPerPage,
					offset: initialPage,
				},
			})
			.catch(noop);
	}

	async function handleUploadFile(file: File) {
		if (isRunningCsv) return;

		try {
			setBlockFilterAndSort(DEFAULT_FILTERS);

			await uploadCsv.mutateAsync({
				bytesParagraphRef,
				blockUuid,
				progressRef,
				file,
			});

			await handleRunCsv();

			await handleMalformedAndWellformedCSVFile({
				totalNumberOfRows: null,
				blockUuid,
				file,
				putNewDataInTableFromNewSource,
			});
		} catch {
			// do nothing
		}
	}

	function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) return;

		handleUploadFile(file).catch(noop);
	}

	function handleOnDrop(e: React.DragEvent<HTMLDivElement>) {
		const file = e.dataTransfer.files[0];

		if (!file || file.type !== "text/csv") {
			// If any of the dropped files are not of type CSV,
			// stop the execution of this function.
			// This will allow the general drop handler to execute
			// instead, creating new blocks for each file.
			return;
		}

		handleUploadFile(file).catch(noop);
	}

	const shouldShowTable = totalNumberOfRows !== null && !isBlockRunning;
	const fileName = csvBlock.custom_block_info?.file_name ?? "";
	const isReadonly = isStreaming || isBlockRunning;

	return (
		<article
			className="w-full group/block"
			onDrop={handleOnDrop}
			id={csvBlock.uuid}
			title="CSV block"
		>
			<header className="flex justify-between items-center gap-3 pb-1">
				<span className="text-muted text-xs">{fileName}</span>
			</header>

			{isBlockRunning ? (
				<Progress
					bytesParagraphRef={bytesParagraphRef}
					progressRef={progressRef}
					type={
						isUploadingCsv
							? ProgressType.UploadWithProgress
							: ProgressType.RunningWithoutProgress
					}
				/>
			) : shouldShowTable ? (
				<div className="border border-border-smooth rounded-lg overflow-hidden">
					<Table.Root
						dataComesFromDataPreview={dataComesFromDataPreview}
						setNumberOfRowsPerPage={setNumberOfRowsPerPage}
						initialBlockFilterAndSort={blockFilterAndSort}
						setBlockFilterAndSort={setBlockFilterAndSort}
						numberOfRowsPerPage={numberOfRowsPerPage}
						totalNumberOfRows={totalNumberOfRows}
						initialPageNumber={initialPage}
						setIsNewSource={setIsNewSource}
						isFetchingData={isFetchingData}
						allData={tableMapStorage}
						isNewSource={isNewSource}
						fetchMore={paginate}
						block={csvBlock}
					>
						<Table.DefaultHeader />

						<Table.Data />

						<Table.DefaultFooter />
					</Table.Root>
				</div>
			) : hasCsvFile ? (
				<div className="h-40 flex flex-col text-xs text-muted items-center justify-center border-2 border-dashed border-border-smooth rounded-lg">
					<p>Preview not available.</p>

					<p>Run the block to get a preview.</p>
				</div>
			) : (
				<div
					className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed hover:border-accent border-border-smooth  aria-disabled:pointer-events-none"
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					aria-disabled={isReadonly}
					title="Select a CSV file"
				>
					<label className="flex cursor-pointer flex-col items-center justify-center p-4 text-center md:p-8">
						<Upload className="size-6 stroke-primary stroke-1" />

						<p className="mx-auto mt-3 max-w-xs text-primary">
							Click to <span className="font-bold">Upload your CSV file</span>{" "}
							or drag and drop your file here
						</p>

						<input
							onChange={handleFileChosen}
							disabled={isReadonly}
							ref={fileInputRef}
							className="hidden"
							accept=".csv"
							type="file"
							max={1}
						/>
					</label>
				</div>
			)}
		</article>
	);
});
