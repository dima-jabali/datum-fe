import { camelCase } from "scule";
import type { CamelCase } from "type-fest";

import { generalCtx, type GeneralCtxData } from "#/contexts/general/ctx";
import {
	SettingsKey,
	type SettingsBase,
	type SettingsReturnType,
} from "#/hooks/get/use-get-settings";

const BOOLEAN_SETTINGS_TO_BE_SET = [] as const;
type BooleanSettingsToBeSet = (typeof BOOLEAN_SETTINGS_TO_BE_SET)[number];
type BooleanKeys = CamelCase<BooleanSettingsToBeSet>;

const STRING_SETTINGS_TO_BE_SET = [SettingsKey.CHAT_BOT_AGENT_NAME] as const;
type StringSettingsToBeSet = (typeof STRING_SETTINGS_TO_BE_SET)[number];
type StringKeys = CamelCase<StringSettingsToBeSet>;

export function updateSettingValuesOnGeneralContext(
	settings: SettingsReturnType,
) {
	// Every time this function is called, we want to update the
	// shouldShowInternalSources and shouldShowCodeInChatMode
	// values in the generalContext store.

	const settingsForGeneralContext: Partial<GeneralCtxData> = {};

	function setGeneralSetting(setting: SettingsBase) {
		// Boolean settings:
		if (
			BOOLEAN_SETTINGS_TO_BE_SET.includes(setting.key as BooleanSettingsToBeSet)
		) {
			const key = camelCase(
				setting.key.toLowerCase() as BooleanSettingsToBeSet,
			) as BooleanKeys;

			// console.log({ key, originalKey: setting.key, value: setting.value });

			// @ts-expect-error
			settingsForGeneralContext[key] = setting.value as boolean;
		} else if (
			STRING_SETTINGS_TO_BE_SET.includes(setting.key as StringSettingsToBeSet)
		) {
			const key = camelCase(
				setting.key.toLowerCase() as StringSettingsToBeSet,
			) as StringKeys;

			// In order to to be able to use both `string | OrganizationSelectorPlacement`
			// we have to cast to any:
			settingsForGeneralContext[key] = setting.value as any;
		}
	}

	// Order matters, as the last one wins
	// Organization -> User -> Project
	// So we start with organization, then user, then project
	// and overwrite the values as we go.
	settings.organization_settings.forEach(setGeneralSetting);
	settings.user_settings.forEach(setGeneralSetting);
	settings.project_settings?.forEach(setGeneralSetting);

	console.log({ settingsForGeneralContext });

	generalCtx.setState(settingsForGeneralContext);
}
