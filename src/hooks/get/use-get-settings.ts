import { generalCtx, useWithOrganizationId } from "#/contexts/general/ctx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeyFactory } from "#/hooks/query-key-factory";
import { identity, noop } from "#/lib/utils";

export type SettingsBase = {
	/** Only present on user_settings and project_settings */
	inheritance_type?: InheritanceType;
	details: {
		default:
			| string
			| number
			| boolean
			| Array<unknown>
			| Record<string, unknown>;
		show_as_project_setting?: boolean;
		show_as_user_setting?: boolean;
		allowed_values?: Array<string>;
		readable_name: string;
		description: string;
		type: DetailsType;
	};
} & SpecificSetting;

type SpecificSetting = {
	key: SettingsKey;
	value:
		| string
		| number
		| boolean
		| Array<unknown>
		| Record<string, unknown>
		| undefined;
};

export enum SettingsKey {
	SHOW_CREATE_NEW_ORGANIZATION_TO_USERS_IN_BB = "SHOW_CREATE_NEW_ORGANIZATION_TO_USERS_IN_BB",
	REQUIRE_APPROVAL_FOR_CONVERSATION_PLANS = "REQUIRE_APPROVAL_FOR_CONVERSATION_PLANS",
	REPLACE_REFERENCE_NUMBERS_WITH_ICONS = "REPLACE_REFERENCE_NUMBERS_WITH_ICONS",
	SHOW_MANAGE_USERS_TO_USERS_IN_BB = "SHOW_MANAGE_USERS_TO_USERS_IN_BB",
	ONLY_SHOW_USED_REFERENCES = "ONLY_SHOW_USED_REFERENCES",
	SHOW_IN_LINE_CITATIONS = "SHOW_IN_LINE_CITATIONS",
	SHOW_INTERNAL_SOURCES = "SHOW_INTERNAL_SOURCES",
	CHAT_BOT_AGENT_NAME = "CHAT_BOT_AGENT_NAME",
}

export enum InheritanceType {
	DEFAULT = "DEFAULT",
	CUSTOM = "CUSTOM",
}

export enum DetailsType {
	BOOLEAN = "BOOLEAN",
	INTEGER = "INTEGER",
	STRING = "STRING",
	FLOAT = "FLOAT",
	ENUM = "ENUM",
	JSON = "JSON",
}

export enum SettingsEntity {
	ORGANIZATION = "ORGANIZATION",
	PROJECT = "PROJECT",
	USER = "USER",
}

export type SettingsReturnType = {
	organization_settings: SettingsBase[];
	/** Only present when project_id is specified as a URL parameter */
	project_settings?: SettingsBase[];
	user_settings: SettingsBase[];
};

export function useFetchSettings<SelectedData = SettingsReturnType>(
	select: (data: SettingsReturnType) => SelectedData = identity<
		SettingsReturnType,
		SelectedData
	>,
) {
	const organizationId = useWithOrganizationId();
	const notebookId = generalCtx.use.notebookId();

	const queryOptions = useMemo(
		() =>
			queryKeyFactory.get["settings"](organizationId, notebookId ?? undefined),
		[notebookId, organizationId],
	);

	return useSuspenseQuery({
		...queryOptions,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		gcTime: Infinity, // Maintain on cache
		select,
	}).data;
}

export function useJustFetchSettings() {
	return useFetchSettings(noop);
}
