import { create } from "zustand";
import {
	createJSONStorage,
	persist,
	subscribeWithSelector,
} from "zustand/middleware";

import { createReactSelectors } from "#/contexts/create-zustand-provider";
import { isValidNumber } from "#/lib/utils";
import type { BotConversationId, NotebookId } from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import type { UserId } from "#/types/user";

export type GeneralCtxData = {
	botConversationId: BotConversationId | null;
	organizationId: OrganizationId | null;
	notebookId: NotebookId | null;
	userId: UserId | null;

	isSidebarOpen: boolean;
};

const generalCtxStoreBase = create(
	persist(
		subscribeWithSelector<GeneralCtxData>(function (_set, _get) {
			return {
				botConversationId: null,
				organizationId: null,
				notebookId: null,
				userId: null,

				isSidebarOpen: false,
			};
		}),
		{
			partialize(state) {
				return {
					botConversationId: state.botConversationId,
					organizationId: state.organizationId,
					notebookId: state.notebookId,
				};
			},
			storage: createJSONStorage(() => localStorage),
			name: "general-ctx",
			version: 0,
		},
	),
);

export const generalCtx = createReactSelectors(generalCtxStoreBase);

export function useWithOrganizationId() {
	const organizationId = generalCtx.use.organizationId();

	if (!isValidNumber(organizationId)) {
		throw new Error("OrganizationId is null");
	}

	return organizationId;
}

export function useWithBotConversationId() {
	const botConversationId = generalCtx.use.botConversationId();

	if (!isValidNumber(botConversationId)) {
		throw new Error("botConversationId is null");
	}

	return botConversationId;
}

export function useWithGeneralStoreNotebookId() {
	const notebookId = generalCtx.use.notebookId();

	if (!isValidNumber(notebookId)) {
		throw new Error("NotebookId is null");
	}

	return notebookId;
}
