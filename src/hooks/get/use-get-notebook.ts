import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { generalCtx } from "#/contexts/general/ctx";
import { identity, isValidNumber } from "#/lib/utils";
import type { NormalDatabaseConnection } from "#/types/databases";
import {
	SqlBlockSourceType,
	type BlockBase,
	type Notebook,
	type NotebookBlockUuid,
} from "#/types/notebook";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { renderNotebookBlock } from "#/components/render-notebook-block";
import type { VariableToSelect } from "#/components/blocks/table-block";

export type FetchNotebookResponse = Notebook;

export function useFetchNotebook<SelectedData = FetchNotebookResponse>(
	select: (data: FetchNotebookResponse) => SelectedData = identity<
		FetchNotebookResponse,
		SelectedData
	>,
) {
	const notebookId = generalCtx.use.notebookId();

	if (!isValidNumber(notebookId)) {
		// shouldNeverHappen(`"notebookId" from general context store is not valid! Got "${notebookId}"`);
		throw new Error(
			`"notebookId" from general context store is not valid! Got "${notebookId}"`,
		);
	}

	const queryOptions = useMemo(
		() => queryKeyFactory.get["notebook-by-id"](notebookId),
		[notebookId],
	);

	return useSuspenseQuery({
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		gcTime: Infinity, // Maintain on cache
		select,
		...queryOptions,
	}).data;
}

function selectNotebookBlocks(data: FetchNotebookResponse) {
	return data.blocks;
}
export function useNotebookBlocks() {
	return useFetchNotebook(selectNotebookBlocks);
}

function selectDownloadedNotebookId(data: FetchNotebookResponse) {
	return data.metadata.id;
}
export function useDownloadedNotebookId() {
	return useFetchNotebook(selectDownloadedNotebookId);
}

function selectDownloadedNotebookUuid(data: FetchNotebookResponse) {
	return data.metadata.uuid;
}
export function useDownloadedNotebookUuid() {
	return useFetchNotebook(selectDownloadedNotebookUuid);
}

function selectDownloadedNotebookOrganizationId(data: FetchNotebookResponse) {
	return data.metadata.organization.id;
}
export function useDownloadedNotebookOrganizationId() {
	return useFetchNotebook(selectDownloadedNotebookOrganizationId);
}

function selectDownloadedNotebookBotConversationId(
	data: FetchNotebookResponse,
) {
	return data.metadata.bot_conversation?.id;
}
export function useDownloadedNotebookBotConversationId() {
	return useFetchNotebook(selectDownloadedNotebookBotConversationId);
}

function selectDownloadedNotebookMetadata(data: FetchNotebookResponse) {
	return data.metadata;
}
export function useDownloadedNotebookMetadata() {
	return useFetchNotebook(selectDownloadedNotebookMetadata);
}

export function useNotebookBlock(uuid: NotebookBlockUuid) {
	const selectBlock = useCallback(
		(data: FetchNotebookResponse) =>
			data.blocks.find((block) => block.uuid === uuid),
		[uuid],
	);

	const notebookBlock = useFetchNotebook(selectBlock);

	return useMemo(
		() => ({
			render: notebookBlock ? renderNotebookBlock(notebookBlock) : null,
			notebookBlock,
		}),
		[notebookBlock],
	);
}

function selectAllDataframes(data: FetchNotebookResponse) {
	return Object.entries(data.metadata.variable_info ?? {})
		.filter(
			([, value]) =>
				value.type ===
				(SqlBlockSourceType.Dataframes as unknown as NormalDatabaseConnection["type"]),
		)
		.map(([key, variable]) => ({ name: key, ...variable }));
}
export function useAllDataframes() {
	return useFetchNotebook(selectAllDataframes);
}

export function useVariablesToSelect(
	blockWriteVariables: BlockBase["write_variables"],
) {
	const selectVariablesToSelect = useCallback(
		(data: FetchNotebookResponse) => {
			const projectVariableInfo = data.metadata.variable_info;

			if (!projectVariableInfo) return [];

			const projectVariables: Array<VariableToSelect> = [];

			for (const key in projectVariableInfo) {
				const variable = projectVariableInfo[key];

				if (
					!variable ||
					variable.type ===
						(SqlBlockSourceType.Dataframes as unknown as NormalDatabaseConnection["type"]) ||
					blockWriteVariables?.some(
						(tableBlockVariable) => tableBlockVariable.name === key,
					)
				) {
					continue;
				}

				projectVariables.push({
					id: variable.id,
					name: key,
					variable,
				});
			}

			return projectVariables;
		},
		[blockWriteVariables],
	);

	return useFetchNotebook(selectVariablesToSelect);
}
