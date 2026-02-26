import {
	BlockType,
	type BlockBase,
	type KernelResult,
	type NotebookBlockUuid,
} from "#/types/notebook";
import { createZustandProvider } from "#/contexts/create-zustand-provider";
import { DEFAULT_FILTERS } from "#/components/table-for-block/filters/filters";
import { generalCtx } from "#/contexts/general/ctx";
import { isValidNumber } from "#/lib/utils";
import { getNotebook } from "#/lib/query-client-helpers";

type BlockStore = {
	blockFilterAndSort: typeof DEFAULT_FILTERS;
	kernelResults: Array<KernelResult>;
	blockUuid: NotebookBlockUuid;
	blockType: BlockType;

	getLatestValue(): BlockBase;
};

export const { Provider: BlockStoreProvider, useStore: useBlockStore } =
	createZustandProvider<BlockStore>(
		(get, _set) => ({
			blockFilterAndSort: DEFAULT_FILTERS,
			blockUuid: "" as NotebookBlockUuid,
			blockType: BlockType.Text,
			kernelResults: [],

			getLatestValue() {
				const { notebookId } = generalCtx.getState();

				if (!isValidNumber(notebookId)) {
					throw new Error("NotebookId is null. Can't get block latest value.");
				}

				const notebook = getNotebook(notebookId);

				if (!notebook) {
					throw new Error("Notebook is null. Can't get block latest value.");
				}

				const thisBlockUuid = get().blockUuid;
				const block = notebook.blocks.find(
					({ uuid }) => uuid === thisBlockUuid,
				);

				if (!block) {
					throw new Error("Block is null. Can't get block latest value.");
				}

				return block;
			},
		}),
		{
			name: "block-context",
		},
	);
