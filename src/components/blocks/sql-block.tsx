import { getErrorMessage } from "react-error-boundary";
import { memo, useEffect, useState } from "react";

import { CodeOutput } from "#/components/blocks/code-output";
import {
	handleDataPreview,
	ZERO_RESULTS_KERNEL_RESULTS,
} from "#/components/blocks/helpers";
import { CodeBlock } from "#/components/Markdown/code-block";
import { DEFAULT_FILTERS } from "#/components/table-for-block/filters/filters";
import { Table } from "#/components/table-for-block/table";
import { useTableHelper } from "#/components/table-for-block/use-table-helper";
import { BlockStoreProvider, useBlockStore } from "#/contexts/block-context";
import {
	useWithBotConversationId,
	useWithOrganizationId,
} from "#/contexts/general/ctx";
import { useIsStreaming } from "#/hooks/get/use-get-bot-conversation";
import { useDownloadedNotebookId } from "#/hooks/get/use-get-notebook";
import { useIsFixingSql } from "#/hooks/mutation/use-fix-sql";
import { usePatchNotebookBlocks } from "#/hooks/mutation/use-patch-notebook-blocks";
import { createISODate, isValidNumber } from "#/lib/utils";
import {
	DataFrameDatabaseConnection,
	KernelResultsTypes,
	NotebookActionType,
	SqlBlockSourceType,
	UpdateBlockActionKey,
	type BlockSql,
	type KernelResult,
} from "#/types/notebook";
import { useGetAllDatabaseConnections } from "#/hooks/get/use-get-all-database-connections";
import { useRunSql } from "#/hooks/mutation/use-run-sql";

type Props = {
	sqlBlock: BlockSql;
};

export const SqlBlock = memo(function SqlBlockWithProviders(props: Props) {
	return (
		<BlockStoreProvider
			extraInitialParams={{
				blockFilterAndSort:
					props.sqlBlock.custom_block_info?.filters || DEFAULT_FILTERS,
				blockUuid: props.sqlBlock.uuid,
				blockType: props.sqlBlock.type,
			}}
		>
			<SqlBlockWithContexts {...props} />
		</BlockStoreProvider>
	);
});

function SqlBlockWithContexts({ sqlBlock }: Props) {
	const sqlCode = sqlBlock.custom_block_info?.query ?? "";
	const blockUuid = sqlBlock.uuid;

	const [blockFilterAndSort, setBlockFilterAndSort] = useState(
		sqlBlock.custom_block_info?.filters ?? DEFAULT_FILTERS,
	);
	const [hasAnyDataToShowUser, setHasAnyDataToShowUser] = useState(false);
	const [hasDataForTable, setHasDataForTable] = useState(false);

	const blockStore = useBlockStore();

	const normalDatabases = useGetAllDatabaseConnections().data.normalDatabases;
	const botConversationId = useWithBotConversationId();
	const patchNotebookBlocks = usePatchNotebookBlocks();
	const organizationId = useWithOrganizationId();
	const isFixingSql = useIsFixingSql(blockUuid);
	const notebookId = useDownloadedNotebookId();
	const isStreaming = useIsStreaming();
	const runSql = useRunSql(blockUuid);

	const isBlockRunning = runSql.isPending || sqlBlock.is_running;
	const errorFromDataPreview =
		sqlBlock?.custom_block_info?.data_preview &&
		"error" in sqlBlock.custom_block_info.data_preview
			? sqlBlock.custom_block_info.data_preview.error
			: null;
	const isDataPreviewStale =
		sqlBlock?.custom_block_info?.is_data_preview_stale || false;
	const dataPreview = sqlBlock.custom_block_info?.data_preview;
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
		setIsFetchingData,
		setIsNewSource,
		paginate,
	} = useTableHelper(sqlBlock.uuid, dataPreviewLength);

	// On first mount, we should show the data preview if available.
	// But if on chat mode, the data preview should show whenever it
	// is updated.
	useEffect(() => {
		if (errorFromDataPreview) {
			blockStore.setState({
				kernelResults: [
					{ type: KernelResultsTypes.ERROR, value: errorFromDataPreview },
				],
			});
			setHasAnyDataToShowUser(true);
			setHasDataForTable(false);
		} else if (dataPreview && !("error" in dataPreview)) {
			handleDataPreview({
				dataPreview,
				setKernelResults: (kernelResults: Array<KernelResult>) =>
					blockStore.setState({ kernelResults }),
				putSavedDataInTheTable,
			});

			setHasAnyDataToShowUser(true);
			setHasDataForTable(true);
		}
	}, [errorFromDataPreview, dataPreview, putSavedDataInTheTable, blockStore]);

	async function handleExecuteSql() {
		if (isBlockRunning) return;

		blockStore.setState({ kernelResults: [] });
		setIsFetchingData(true);

		try {
			if (sqlCode === undefined) {
				throw new Error("SQL code is undefined. This should not happen.");
			}

			await patchNotebookBlocks.mutateAsync({
				timestamp: createISODate(),
				botConversationId,
				organizationId,
				notebookId,
				updates: [
					{
						action_type: NotebookActionType.UpdateBlock,
						action_info: {
							key: UpdateBlockActionKey.Query,
							block_uuid: sqlBlock.uuid,
							value: sqlCode,
						},
					},
				],
			});

			const res = await runSql.mutateAsync({
				action_info: {
					filters: sqlBlock.custom_block_info?.filters || DEFAULT_FILTERS,
					limit: numberOfRowsPerPage > 1 ? numberOfRowsPerPage : 10,
					sql: sqlCode,
					offset: 0,
				},
			});

			const { data, num_rows } = res.action_output;

			// Workaround for when the data is missing, usually because of errors
			if (data) {
				const hasRows = data.length > 0 && num_rows > 0;

				setHasAnyDataToShowUser(true);
				setHasDataForTable(hasRows);

				if (hasRows) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					putNewDataInTableFromNewSource(data as any[], num_rows);
				} else {
					blockStore.setState({ kernelResults: ZERO_RESULTS_KERNEL_RESULTS });
				}
			}
		} catch (error) {
			setHasAnyDataToShowUser(true);
			setHasDataForTable(false);

			blockStore.setState({
				kernelResults: [
					{
						value:
							getErrorMessage(error) ?? "See console for more information.",
						type: KernelResultsTypes.ERROR,
					},
				],
			});
		} finally {
			setIsFetchingData(false);
		}
	}

	const blockSourceIntegrationId =
		sqlBlock.custom_block_info?.source_integration?.id;
	const blockSourceIntegrationType =
		sqlBlock.custom_block_info?.source_integration?.type;
	const selectedDatabase =
		sqlBlock.custom_block_info?.source_type === SqlBlockSourceType.Dataframes
			? DataFrameDatabaseConnection
			: isValidNumber(blockSourceIntegrationId)
				? (normalDatabases.find(
						(db) =>
							db.id === blockSourceIntegrationId &&
							db.type === blockSourceIntegrationType,
					) ?? normalDatabases[0])
				: normalDatabases[0];
	const shouldShowTable =
		hasAnyDataToShowUser && hasDataForTable && totalNumberOfRows !== null;
	const isAnythingLoading =
		patchNotebookBlocks.isPending ||
		runSql.isPending ||
		isBlockRunning ||
		isFetchingData ||
		isFixingSql ||
		isStreaming;

	console.log({ selectedDatabase });

	return (
		<article
			className="w-full flex flex-col border rounded-md border-border-smooth"
			id={sqlBlock.uuid}
			title="SQL block"
		>
			{/* {!true ? (
					<header className="sql-block-header">
						<DatabaseConnectionsModal
							selectedDatabaseOrDataframe={selectedDatabase}
							disabled={isAnythingLoading}
							sqlBlock={sqlBlock}
						/>

						<textarea
							className="no-ring resize-none simple-scrollbar p-2 w-full min-h-[1lh] field-sizing-content text-sm data-[loading=true]:text-loading text-muted sql-block-header-textarea"
							placeholder="Ask a question to this SQL block…"
							data-loading={askToGenerateSqlCode.isPending}
							onKeyDown={handleAskAiOnEnter}
							onChange={handleChangeCommand}
						/>

						<button
							className="flex items-center justify-center button-hover h-9 w-full sql-block-header-button"
							onClick={handleAskForBackendToGenerateSqlCode}
							title="Ask question"
							type="button"
						>
							{askToGenerateSqlCode.isPending ? (
								LOADER
							) : (
								<Forward className="size-4" />
							)}
						</button>
					</header>
				) : null} */}

			<CodeBlock
				wrapperClassName="border-none"
				isLoading={isAnythingLoading}
				text={sqlCode}
				lang="sql"
			/>

			{shouldShowTable ? (
				<Table.Root
					dataComesFromDataPreview={dataComesFromDataPreview}
					setNumberOfRowsPerPage={setNumberOfRowsPerPage}
					initialBlockFilterAndSort={blockFilterAndSort}
					setBlockFilterAndSort={setBlockFilterAndSort}
					numberOfRowsPerPage={numberOfRowsPerPage}
					totalNumberOfRows={totalNumberOfRows}
					setIsNewSource={setIsNewSource}
					isFetchingData={isFetchingData}
					initialPageNumber={initialPage}
					allData={tableMapStorage}
					isNewSource={isNewSource}
					reload={handleExecuteSql}
					fetchMore={paginate}
					block={sqlBlock}
				>
					<Table.DefaultHeader className="border-t" />

					<Table.Data />

					<Table.DefaultFooter />
				</Table.Root>
			) : null}

			<CodeOutput isDataPreviewStale={isDataPreviewStale} isSqlBlock />
		</article>
	);
}
