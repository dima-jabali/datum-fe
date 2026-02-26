import { isEqual } from "es-toolkit";
import { AtSign, Check } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { FallbackLoader } from "#/components/default-suspense-and-error-boundary";
import { BlockStoreProvider, useBlockStore } from "#/contexts/block-context";
import { usePatchNotebookBlocks } from "#/hooks/mutation/use-patch-notebook-blocks";
import {
	NotebookActionType,
	UpdateBlockActionKey,
	type BlockTable,
	type Variable,
} from "#/types/notebook";
import { DEFAULT_FILTERS } from "#/components/table-for-block/filters/filters";
import {
	useDownloadedNotebookId,
	useVariablesToSelect,
} from "#/hooks/get/use-get-notebook";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useTableHelper } from "#/components/table-for-block/use-table-helper";
import {
	getVariableName,
	handleDataPreview,
} from "#/components/blocks/helpers";
import { createISODate, noop } from "#/lib/utils";
import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import { LOADER } from "#/components/loader";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/components/ui/command";
import { Table } from "#/components/table-for-block/table";
import { useRunTableBlock } from "#/hooks/mutation/use-run-table-block";

type Props = {
	tableBlock: BlockTable;
};

export type VariableToSelect = {
	id: number | undefined;
	variable: Variable;
	name: string;
};

export const TableBlock = memo(function TableBlock(props: Props) {
	return (
		<BlockStoreProvider
			extraInitialParams={{
				blockFilterAndSort:
					props.tableBlock.custom_block_info?.filters || DEFAULT_FILTERS,
				blockUuid: props.tableBlock.uuid,
			}}
		>
			<TableBlockRoot {...props} />
		</BlockStoreProvider>
	);
});

function TableBlockRoot({ tableBlock }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const variablesToSelect = useVariablesToSelect(tableBlock.write_variables);
	const patchNotebookBlocks = usePatchNotebookBlocks();
	const botConversationId = useWithBotConversationId();
	const organizationId = useWithOrganizationId();
	const notebookId = useDownloadedNotebookId();
	const runTableBlock = useRunTableBlock();
	const blockStore = useBlockStore();

	const isBlockRunning =
		patchNotebookBlocks.isPending || runTableBlock.isPending;
	const selectedVariableName = getVariableName(tableBlock.read_variables);
	const dataPreview = tableBlock?.custom_block_info?.data_preview;
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
	} = useTableHelper(tableBlock.uuid, dataPreviewLength);

	useEffect(() => {
		handleDataPreview({ dataPreview, putSavedDataInTheTable });
	}, [dataPreview, putSavedDataInTheTable]);

	function handleRunBlock() {
		if (runTableBlock.isPending) return;

		runTableBlock
			.mutateAsync({
				action_info: {
					filters: blockStore.getState().blockFilterAndSort,
					limit: numberOfRowsPerPage,
					offset: initialPage,
				},
			})
			.then((res) => {
				putNewDataInTableFromNewSource(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					res.action_output.data as any,
					res.action_output.num_rows,
				);
			})
			.catch(noop);
	}

	function handleSelect(variable: VariableToSelect) {
		if (!variable.name || isBlockRunning) return;

		const nextVar = [{ name: variable.name }];

		if (isEqual(nextVar, tableBlock.read_variables)) return;

		setIsOpen(false);

		patchNotebookBlocks
			.mutateAsync({
				timestamp: createISODate(),
				botConversationId,
				organizationId,
				notebookId,
				updates: [
					{
						action_type: NotebookActionType.UpdateBlock,
						action_info: {
							key: UpdateBlockActionKey.ReadVariables,
							block_uuid: tableBlock.uuid,
							value: nextVar,
						},
					},
				],
			})
			.then(handleRunBlock)
			.catch(noop);
	}

	const shouldShowTable = totalNumberOfRows !== null && !isBlockRunning;

	return (
		<article
			className="w-full flex flex-col gap-1"
			id={tableBlock.uuid}
			title="Table block"
		>
			<header className="flex justify-between items-center">
				<NativePopover onOpenChange={setIsOpen} isOpen={isOpen}>
					<NativePopoverTrigger
						className="w-fit flex items-center justify-between bg-transparent rounded-lg button-hover text-primary hover:text-primary text-xs p-1 px-2 gap-1 h-fit data-[is-open=true]:bg-button-hover border border-border-smooth disabled:pointer-events-none disabled:opacity-80"
						title="Select variable to show its data"
						disabled={isBlockRunning}
					>
						{isBlockRunning ? (
							LOADER
						) : (
							<AtSign className="size-3 flex-none text-accent" />
						)}

						<i>
							{selectedVariableName ? selectedVariableName : "Select variable"}
						</i>
					</NativePopoverTrigger>

					{isOpen ? (
						<NativePopoverContent className="w-[200px] p-0 z-10 border border-border-smooth rounded-lg">
							<Command>
								<CommandInput placeholder="Search variable…" />

								<CommandList>
									<CommandEmpty className="py-6 text-center text-xs text-muted">
										No variables found
									</CommandEmpty>

									<CommandGroup>
										{variablesToSelect.map((variable) => (
											<CommandItem
												title={`Select variable "${variable.name}"`}
												onSelect={() => handleSelect(variable)}
												key={variable.id || variable.name}
												className="button-hover"
												value={variable.name}
											>
												<Check
													className="mr-2 size-4 opacity-0 data-[visible=true]:opacity-100 flex-none"
													data-visible={selectedVariableName === variable.name}
												/>

												<span className="truncate whitespace-nowrap">
													{variable.name}
												</span>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</NativePopoverContent>
					) : null}
				</NativePopover>
			</header>

			{shouldShowTable ? (
				<Table.Root
					className="border border-border-smooth rounded-lg"
					dataComesFromDataPreview={dataComesFromDataPreview}
					setNumberOfRowsPerPage={setNumberOfRowsPerPage}
					numberOfRowsPerPage={numberOfRowsPerPage}
					totalNumberOfRows={totalNumberOfRows}
					initialPageNumber={initialPage}
					setIsNewSource={setIsNewSource}
					isFetchingData={isFetchingData}
					allData={tableMapStorage}
					isNewSource={isNewSource}
					fetchMore={paginate}
					block={tableBlock}
				>
					<Table.DefaultHeader />

					<Table.Data />

					<Table.DefaultFooter />
				</Table.Root>
			) : (
				<section className="flex h-80 mt-2 items-center justify-center rounded-md border-2 border-dashed border-border-smooth hover:border-accent text-primary font-semibold">
					{isBlockRunning ? (
						<FallbackLoader fallbackFor="table-block" />
					) : selectedVariableName ? (
						<p>Run block to see table!</p>
					) : (
						<p>Select a variable to display its data in a table!</p>
					)}
				</section>
			)}
		</article>
	);
}
