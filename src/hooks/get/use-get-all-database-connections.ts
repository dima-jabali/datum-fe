import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useWithOrganizationId } from "#/contexts/general/ctx";
import { identity } from "#/lib/utils";
import {
	type AirtableDatabaseConnection,
	type ClickUpConnectionType,
	type DatabaseConnection,
	type GoogleDriveDatabaseConnection,
	type NormalDatabaseConnection,
	type SlackChannel,
	type SlackChannelWithName,
	type SlackConnectionDataWithDefinedChannels,
} from "#/types/databases";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type AllDatabaseConnections = {
	botDatabaseConnections: Array<SlackConnectionDataWithDefinedChannels>;
	airtableDatabaseConnections: Array<AirtableDatabaseConnection>;
	googleDriveDatabases: Array<GoogleDriveDatabaseConnection>;
	allDatabaseConnections: Array<DatabaseConnection>;
	normalDatabases: Array<NormalDatabaseConnection>;
	clickUpConnections: Array<ClickUpConnectionType>;
};

export type FetchDatabasesConnectionsResponse = {
	results: DatabaseConnection[];
};

export function slackChannelWithName(
	channel: SlackChannel | undefined,
): channel is SlackChannelWithName {
	return typeof channel?.name === "string";
}

export function useGetAllDatabaseConnections<
	SelectedData = AllDatabaseConnections,
>(
	select: (data: AllDatabaseConnections) => SelectedData = identity<
		AllDatabaseConnections,
		SelectedData
	>,
) {
	const organizationId = useWithOrganizationId();

	const queryOptions = useMemo(
		() => queryKeyFactory.get["all-database-connections"](organizationId),
		[organizationId],
	);

	return useSuspenseQuery({
		staleTime: 5 * 60 * 1_000, // 5 minutes,
		refetchOnMount: false,
		gcTime: Infinity, // Maintain on cache
		...queryOptions,
		select,
	});
}
