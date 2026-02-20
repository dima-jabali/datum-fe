import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ISODateString, UUID } from "#/types/general";
import type {
	NotebookBlockUuid,
	NotebookId,
	NotebookUuid,
} from "#/types/notebook";
import type { BotConversationMessageUuid } from "#/types/chat";
import type { RequestId } from "#/types/websocket";

export const OPTIMISTIC_NEW_NOTEBOOK_ID = Number.EPSILON as NotebookId;

/** Make sure this corresponds to the media query in `global-styles.css`!! */
export function isMobile() {
	return window.matchMedia("(max-width: 32rem)").matches;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stringifyUnknown(value: unknown, jsonSpace = 2): string {
	if (value instanceof HTMLElement) {
		return value.outerHTML;
	}

	switch (typeof value) {
		case "function":
		case "boolean":
		case "symbol":
		case "bigint":
		case "number":
		case "string":
			return `${value.toString()}`;

		case "object": {
			if (value === null) return "";

			try {
				return JSON.stringify(value, null, jsonSpace);
			} catch (error) {
				console.log("Error stringifying object at `stringifyUnknown()`:", {
					error,
					value,
				});

				return "";
			}
		}

		case "undefined":
			return "";
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isValidNumber(value: unknown): value is number {
	return value === 0 ? true : Number.isFinite(value || undefined);
}

export function isRecord(obj: unknown): obj is Record<string, unknown> {
	return typeof obj === "object" && obj !== null;
}

export function createISODate() {
	return new Date().toISOString() as ISODateString;
}

export const isDev = import.meta.env.DEV;

export function log(...args: unknown[]) {
	if (isDev) {
		console.log(...args);
	}
}

export function identity<In, Out = In>(value: In) {
	return value as unknown as Out;
}

export function noop(): any {}

export function createUUID() {
	return (globalThis.crypto?.randomUUID() || "") as UUID;
}

export function createNotebookUuid() {
	return createUUID() as unknown as NotebookUuid;
}

export function createRequestId() {
	return createUUID() as unknown as RequestId;
}

export function createNotebookBlockUuid() {
	return createUUID() as unknown as NotebookBlockUuid;
}

export function createBotConversationMessageUuid() {
	return createUUID() as unknown as BotConversationMessageUuid;
}

export function stopPropagation(event: { stopPropagation: () => void }) {
	event.stopPropagation();
}

export function preventDefault(event: { preventDefault: () => void }) {
	event.preventDefault();
}
