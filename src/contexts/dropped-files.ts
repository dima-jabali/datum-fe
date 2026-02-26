import type { NotebookBlockUuid } from "#/types/notebook";

export type PromiseToWaitForFileToBeUploaded = {
	promise: Promise<void>;
	resolve: () => void;
	reject: () => void;
};

export const droppedFiles: Map<
	NotebookBlockUuid,
	{
		promiseToWaitForFileToBeUploaded?: PromiseToWaitForFileToBeUploaded;
		file: File;
	}
> = new Map();
