import { create } from "zustand";
import {
	createJSONStorage,
	persist,
	subscribeWithSelector,
} from "zustand/middleware";

import { createReactSelectors } from "#/contexts/create-zustand-provider";
import { isValidNumber } from "#/lib/utils";
import type {
	BotConversationId,
	ChatTools,
	NotebookId,
} from "#/types/notebook";
import type { OrganizationId } from "#/types/organization";
import type { UserId } from "#/types/user";
import { useWithCurrentOrg } from "#/hooks/use-current-organization";
import type { SourceID } from "#/types/chat";
import type { SourceMainValuesContainer } from "#/lib/sources-for-user/source-main-values-container";

export enum ToolSelectionType {
	SINGLE_SELECT = "SINGLE_SELECT",
	MULTI_SELECT = "MULTI_SELECT",
}

export type GeneralCtxData = {
	botConversationId: BotConversationId | null;
	organizationId: OrganizationId | null;
	notebookId: NotebookId | null;
	userId: UserId | null;

	userChatTools: Record<OrganizationId, Array<ChatTools>>;
	toolSelectionType: ToolSelectionType;

	chatListRef: HTMLOListElement | null;
	messageInputText: string;
	isSidebarOpen: boolean;
	files: Array<File>;

	windowResizerObserver: ResizeObserver;
	windowHeight: number;
	windowWidth: number;
	isMobile: boolean;

	sourcesMainValues: Map<SourceID, SourceMainValuesContainer<any, any>>;
	chatBotAgentName: string;
};

const generalCtxStoreBase = create(
	persist(
		subscribeWithSelector<GeneralCtxData>(function (set, _get) {
			return {
				botConversationId: null,
				organizationId: null,
				notebookId: null,
				userId: null,

				toolSelectionType: ToolSelectionType.MULTI_SELECT,
				userChatTools: {},

				isSidebarOpen: false,
				messageInputText: "",
				chatListRef: null,
				files: [],

				windowResizerObserver: (() => {
					if (!globalThis.window) {
						return null!;
					}

					// Convert rem to pixels for the ResizeObserver logic
					const thresholdPx =
						32 *
						parseFloat(getComputedStyle(document.documentElement).fontSize);

					const observer = new ResizeObserver((entries) => {
						for (const entry of entries) {
							set({
								isMobile: entry.contentRect.width < thresholdPx,
								windowHeight: entry.contentRect.height,
								windowWidth: entry.contentRect.width,
							});
						}
					});

					observer.observe(document.documentElement);

					return observer;
				})(),
				isMobile: false,
				windowHeight: 0,
				windowWidth: 0,

				sourcesMainValues: new Map(),
				chatBotAgentName: "AI",
			};
		}),
		{
			partialize(state) {
				return {
					botConversationId: state.botConversationId,
					messageInputText: state.messageInputText,
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

export function useUserChatTools() {
	const org = useWithCurrentOrg();

	return generalCtx.use.userChatTools()[org.id] ?? org.default_chat_tools;
}
