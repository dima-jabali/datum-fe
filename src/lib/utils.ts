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

export function getRandomSnakeCaseName(): string {
	// Generate a random number between 10000 and 99999
	const randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

	return `dataframe_${randomNumber}`;
}

export const messageDateFormatter = new Intl.DateTimeFormat(undefined, {
	minute: "numeric",
	hour: "numeric",
	year: "numeric",
	day: "numeric",
	month: "short",
});

export async function handleCopyTextToClipboard(
	text: string,
	setWasCopiedSuccessfully: React.Dispatch<
		React.SetStateAction<boolean | undefined>
	>,
) {
	try {
		await navigator.clipboard.writeText(text);

		setWasCopiedSuccessfully(true);

		setTimeout(() => {
			setWasCopiedSuccessfully(undefined);
		}, 2_000);
	} catch (error) {
		console.error("Failed to copy message:", error);

		setWasCopiedSuccessfully(false);

		setTimeout(() => {
			setWasCopiedSuccessfully(undefined);
		}, 2_000);
	}
}

export function isObjectEmpty(arg: unknown) {
	if (!isRecord(arg)) {
		console.log("isObjectEmpty() argument:", { arg });

		throw new Error("Argument must be an object");
	}

	for (const _ in arg) {
		return false;
	}

	return true;
}

export function hidePopover(id: string) {
	const element = document.getElementById(id);

	if (element) {
		element.hidePopover();
	}
}

export function convertArrayOfObjectsToCSV(
	arr: Record<string, string | number>[],
) {
	const array: (Record<string, string | number> | string[])[] = [
		Object.keys(arr[0] || {}),
	];

	array.push(...arr);

	return array
		.map((item) =>
			Object.values(item)
				.map((value) => `"${value}"`)
				.toString(),
		)
		.join("\n");
}

const UNITS = ["bytes", "kB", "MB", "GB", "TB", "PB"] as const;
const MATH_LOG_1024 = Math.log(1024);
export function prettyBytes(bytes: number) {
	if (!isValidNumber(bytes)) return "-";

	const number = Math.floor(Math.log(bytes) / MATH_LOG_1024);

	return `${(bytes / Math.pow(1024, Math.floor(number))).toFixed(2)} ${UNITS[number]}`;
}

export function handleDragOver(e: React.DragEvent<HTMLElement>) {
	e.stopPropagation();
	e.preventDefault();
}

export function handleDragEnter(e: React.DragEvent<HTMLElement>) {
	e.stopPropagation();
	e.preventDefault();
}

export function handleDragLeave(e: React.DragEvent<HTMLElement>) {
	e.stopPropagation();
}

export function fileToTextString(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		// Read the file as a plain text string
		reader.readAsText(file);

		// Success handler
		reader.onload = () => {
			resolve(reader.result as string);
		};

		// Error handler
		reader.onerror = (error) => {
			reject(error);
		};
	});
}

export const GET_AWS_FILE_AS_STRING_BINARY_ACTION =
	"GET_AWS_FILE_AS_STRING_BINARY_ACTION";
export const UPLOAD_FILE_STRING_TO_AWS_ACTION =
	"UPLOAD_FILE_STRING_TO_AWS_ACTION";
export const GET_AWS_BASE64_FILE_ACTION = "GET_AWS_BASE64_FILE_ACTION";
export const DELETE_AWS_FILE_ACTION = "DELETE_AWS_FILE_ACTION";
export const UPLOAD_FILE_TO_AWS = "UPLOAD_FILE_TO_AWS";
export const GET_PRESIGNED_URL = "GET_PRESIGNED_URL";
