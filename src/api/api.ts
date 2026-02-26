import axios from "axios";
import type { QueryClient } from "@tanstack/react-query";
import { uniqBy } from "es-toolkit";
import { toast } from "sonner";
import { getErrorMessage } from "react-error-boundary";

import { createISODate, isValidNumber, log } from "#/lib/utils";
import { clientAPI_V1, clientBareAPI } from "#/api/axios";
import type { User, UserId } from "#/types/user";
import type {
	Organization,
	OrganizationId,
	OrganizationMember,
} from "#/types/organization";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import type { BotConversationId, NotebookId, PdfId } from "#/types/notebook";
import type { FileId } from "#/types/file";
import type { GetOrganizationsResponse } from "#/hooks/get/use-get-all-organizations";
import {
	DatabaseConnectionType,
	type AirtableDatabaseConnection,
	type ClickUpConnectionType,
	type DatabaseConnection,
	type GoogleDriveDatabaseConnection,
	type NormalDatabaseConnection,
	type SlackConnectionDataWithDefinedChannels,
} from "#/types/databases";
import {
	slackChannelWithName,
	type AllDatabaseConnections,
	type FetchDatabasesConnectionsResponse,
} from "#/hooks/get/use-get-all-database-connections";
import type {
	GetBotConversationMessagesPageRequest,
	GetBotConversationMessagesPageResponse,
} from "#/hooks/get/use-get-bot-conversation-message-list-page";
import type {
	FetchNotebookListPageParams,
	FetchNotebookListPageResponse,
} from "#/hooks/get/use-get-notebook-list-page";
import type { GetBotConversationByIdResponse } from "#/hooks/get/use-get-bot-conversation";
import type {
	FetchOrganizationUsersRequest,
	FetchOrganizationUsersResponse,
} from "#/hooks/get/use-get-org-users-page";
import type { FetchNotebookResponse } from "#/hooks/get/use-get-notebook";
import type { SettingsReturnType } from "#/hooks/get/use-get-settings";
import type { GetPresignedUrlByFileIdResponse } from "#/hooks/get/use-get-pdf-file-by-id";
import type { GetBotPlanResponse } from "#/hooks/get/use-fetch-bot-plan";
import type { Plan } from "#/types/chat";
import { applyNotebookResponseUpdates } from "#/lib/apply-notebook-response-updates";
import { updateSettingValuesOnGeneralContext } from "#/lib/update-setting-values-on-general-context";

export const api = {
	get: {
		"bot-plan": async (
			botConversationId: BotConversationId,
			organizationId: OrganizationId,
			notebookId: NotebookId,
		) => {
			if (botConversationId === (Number.EPSILON as BotConversationId)) {
				return null;
			}

			const start = performance.now();

			const path = `/bot-conversations/${botConversationId}/active-plan`;

			const res = await clientAPI_V1.get<GetBotPlanResponse>(path);

			const { updates, plan } = res.data;

			const sortedSubSteps = plan?.sub_tasks?.toSorted(
				(a, b) => a.step_num - b.step_num,
			);

			const newPlan = plan
				? ({ ...plan, sub_tasks: sortedSubSteps } satisfies Plan)
				: null;

			if (updates && updates.length > 0) {
				applyNotebookResponseUpdates({
					organizationId,
					response: {
						bot_conversation_id: botConversationId,
						timestamp: createISODate(),
						project_id: notebookId,
						updates,
					},
				});
			}

			log(
				`useFetchActivePlan(botConversationId = ${botConversationId}) took ${performance.now() - start}ms`,
			);

			return newPlan;
		},

		"org-member": async (organizationId: OrganizationId, userId: UserId) => {
			const res = await clientAPI_V1.get<OrganizationMember>(
				`/organizations/${organizationId}/users/${userId}`,
			);

			return res.data;
		},

		"organization-users": async (
			organizationId: OrganizationId,
			queryParams: FetchOrganizationUsersRequest | null,
			queryClient: QueryClient,
		) => {
			try {
				const searchParams = new URLSearchParams(
					queryParams as unknown as Record<string, string>,
				).toString();

				const res = await clientAPI_V1.get<FetchOrganizationUsersResponse>(
					`/organizations/${organizationId}/users?${searchParams}`,
				);

				queryClient.setQueryData<Array<Organization>>(
					queryKeyFactory.get["all-organizations"].queryKey,
					(prevAllOrganizations) => {
						if (!prevAllOrganizations) return [];

						const prevOrganizationIndex = prevAllOrganizations.findIndex(
							(organization) => organization.id === organizationId,
						);

						const prevOrganization =
							prevAllOrganizations[prevOrganizationIndex];

						if (!prevOrganization) return prevAllOrganizations;

						const nextAllOrganizations: typeof prevAllOrganizations = [
							...prevAllOrganizations,
						];

						const nextUsers = uniqBy(
							prevOrganization.members.users.concat(res.data.results),
							(user) => user.id,
						);

						nextAllOrganizations[prevOrganizationIndex] = {
							...prevOrganization,
							members: {
								total: res.data.total_results,
								offset: res.data.offset,
								limit: res.data.limit,
								users: nextUsers,
							},
						};

						return nextAllOrganizations;
					},
				);

				return res.data;
			} catch (error) {
				toast.error("Error getting organization users!", {
					description: getErrorMessage(error),
				});

				throw error;
			}
		},

		"all-organizations": async () => {
			try {
				const res =
					await clientAPI_V1.get<GetOrganizationsResponse>("/organizations");

				return res.data.results;
			} catch (error) {
				console.error("allOrganizatinosQuery error:", error);

				toast.error("Error getting all organizations!", {
					description: getErrorMessage(error),
				});

				throw error;
			}
		},

		"all-database-connections": async (organizationId: OrganizationId) => {
			if (!isValidNumber(organizationId)) {
				throw new Error(`Invalid organizationId: "${organizationId}"`);
			}

			const res = await clientBareAPI.get<FetchDatabasesConnectionsResponse>(
				`connections/?organization_id=${organizationId}`,
			);

			const allDatabaseConnections = res.data.results;

			const isNormalDatabaseConnection = (
				db: DatabaseConnection,
			): db is NormalDatabaseConnection =>
				db.type === DatabaseConnectionType.ExternalDatasource ||
				db.type === DatabaseConnectionType.OracleDatabase ||
				db.type === DatabaseConnectionType.Snowflake ||
				db.type === DatabaseConnectionType.BigQuery ||
				db.type === DatabaseConnectionType.Postgres;

			const isBotDatabaseConnection = (
				db: DatabaseConnection,
			): db is SlackConnectionDataWithDefinedChannels =>
				db.type === DatabaseConnectionType.Slack;

			const isClickUpConnection = (
				db: DatabaseConnection,
			): db is ClickUpConnectionType =>
				db.type === DatabaseConnectionType.ClickUp;

			const isAirtableDatabaseConnection = (
				db: DatabaseConnection,
			): db is AirtableDatabaseConnection =>
				db.type === DatabaseConnectionType.Airtable;

			const isGoogleDriveDatabaseConnection = (
				db: DatabaseConnection,
			): db is GoogleDriveDatabaseConnection =>
				db.type === DatabaseConnectionType.GoogleDrive;

			const store: AllDatabaseConnections = {
				allDatabaseConnections,

				// Derived values from `allDatabaseConnections`:
				airtableDatabaseConnections: allDatabaseConnections.filter(
					isAirtableDatabaseConnection,
				),
				normalDatabases: allDatabaseConnections.filter(
					isNormalDatabaseConnection,
				),
				googleDriveDatabases: allDatabaseConnections.filter(
					isGoogleDriveDatabaseConnection,
				),
				botDatabaseConnections: allDatabaseConnections
					.filter(isBotDatabaseConnection)
					.map((oldDb) => {
						const newDb = { ...oldDb };

						// Only channels with name defined matters to us:
						newDb.channels = newDb.channels.filter(slackChannelWithName);

						return newDb;
					}),
				clickUpConnections: allDatabaseConnections.filter(isClickUpConnection),
			};

			return store;
		},

		"bot-conversation-message-list-page": async (
			pageParam: GetBotConversationMessagesPageRequest,
		) => {
			const { botConversationId, ...searchParamsObj } = pageParam;

			const searchParams = new URLSearchParams(
				searchParamsObj as unknown as Record<string, string>,
			);

			const res =
				await clientAPI_V1.get<GetBotConversationMessagesPageResponse>(
					`/bot-conversations/${botConversationId}/messages?${searchParams.toString()}`,
				);

			return res.data;
		},

		"notebook-by-id": async (notebookId: NotebookId) => {
			if (!isValidNumber(notebookId)) {
				throw new Error(
					`notebookId is not valid. Expected a number, got ${notebookId}`,
				);
			}

			const start = performance.now();

			const res = await clientAPI_V1.get<FetchNotebookResponse>(
				`/projects/${notebookId}`,
			);

			log(
				`useFetchNotebook(notebookId = ${notebookId}) took ${performance.now() - start}ms`,
			);

			return res.data;
		},

		"notebook-list-page": async (
			pageParam: FetchNotebookListPageParams,
			organizationId: OrganizationId,
		) => {
			const objForUrlSearchParams: typeof pageParam = {
				...pageParam,
			};

			for (const key in objForUrlSearchParams) {
				// @ts-expect-error => ignore
				const value = objForUrlSearchParams[key]!;

				if (value === null || value === undefined) {
					Reflect.deleteProperty(objForUrlSearchParams, key);
				}
			}

			const queryParamsString = new URLSearchParams(
				objForUrlSearchParams as unknown as Record<string, string>,
			).toString();

			const res = await clientAPI_V1.get<FetchNotebookListPageResponse>(
				`/organizations/${organizationId}/projects?${queryParamsString}`,
			);

			return res.data;
		},

		"bot-conversation": async (botConversationId: BotConversationId) => {
			const res = await clientAPI_V1.get<GetBotConversationByIdResponse>(
				`/bot-conversations/${botConversationId}`,
			);

			return res.data;
		},

		user: async () => {
			const res = await clientAPI_V1.get<User>("/user");

			const user = res.data;

			return user;
		},

		settings: async (
			organizationId: OrganizationId,
			notebookId: NotebookId | undefined,
		) => {
			const path = `/organizations/${organizationId}/settings${
				isValidNumber(notebookId) ? `?project_id=${notebookId}` : ""
			}`;

			const settings = (await clientAPI_V1.get<SettingsReturnType>(path)).data;

			updateSettingValuesOnGeneralContext(settings);

			return settings;
		},

		"pdf-file-by-id": async (pdfFileId: FileId | PdfId | undefined) => {
			try {
				const presignedUrlResponse =
					await clientAPI_V1.get<GetPresignedUrlByFileIdResponse>(
						`/files/${pdfFileId}`,
					);

				if (presignedUrlResponse.status !== 200) {
					throw new Error("Failed to fetch presigned URL");
				}

				const presigned_url = presignedUrlResponse.data.presigned_url;

				const fileResponse = await axios.get(presigned_url, {
					responseType: "arraybuffer",
				});

				if (fileResponse.status !== 200) {
					throw new Error("Failed to fetch file");
				}

				const blob = new Blob([fileResponse.data], {
					type: "application/pdf",
				});
				const fileUrl = URL.createObjectURL(blob);

				return { fileUrl, fileName: presignedUrlResponse.data.file_name };
			} catch (error) {
				toast.error("Error fetching PDF file", {
					description: getErrorMessage(error),
				});

				throw error;
			}
		},
	},
};
