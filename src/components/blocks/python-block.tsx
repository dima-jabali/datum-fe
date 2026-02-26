import { memo, useEffect } from "react";

import { CodeOutput } from "#/components/blocks/code-output";
import { CodeBlock } from "#/components/Markdown/code-block";
import { BlockStoreProvider, useBlockStore } from "#/contexts/block-context";
import { useIsStreaming } from "#/hooks/get/use-get-bot-conversation";
import { useIsRunningPython } from "#/hooks/mutation/use-run-python";
import { KernelResultsTypes, type BlockPython } from "#/types/notebook";

export type VariableData = {
	name: string;
};

export type ParseErrorResult = {
	results: string | string[];
	superError?: boolean;
	error: boolean;
};

type Props = {
	pythonBlock: BlockPython;
};

export const PythonBlock = memo(function PythonBlockWithProviders(
	props: Props,
) {
	return (
		<BlockStoreProvider
			extraInitialParams={{
				blockUuid: props.pythonBlock.uuid,
				blockType: props.pythonBlock.type,
			}}
		>
			<PythonBlockWithContexts {...props} />
		</BlockStoreProvider>
	);
});

function PythonBlockWithContexts({ pythonBlock }: Props) {
	const code = pythonBlock.custom_block_info?.code ?? "";
	const blockUuid = pythonBlock.uuid;

	const isRunningPython = useIsRunningPython(blockUuid);
	const isStreaming = useIsStreaming();
	const blockStore = useBlockStore();

	const isBlockRunning = isRunningPython || pythonBlock.is_running;
	const isAnythingLoading = isBlockRunning || isStreaming;

	const errorFromDataPreview =
		pythonBlock.custom_block_info?.data_preview &&
		"error" in pythonBlock.custom_block_info.data_preview
			? pythonBlock.custom_block_info.data_preview.error
			: null;
	const dataPreview = pythonBlock.custom_block_info?.data_preview;
	const isDataPreviewStale =
		pythonBlock.custom_block_info?.is_data_preview_stale || false;

	// The data preview should show whenever it is updated.
	useEffect(() => {
		if (errorFromDataPreview) {
			blockStore.setState({
				kernelResults: [
					{ type: KernelResultsTypes.ERROR, value: errorFromDataPreview },
				],
			});
		} else if (dataPreview && !("error" in dataPreview)) {
			blockStore.setState({ kernelResults: dataPreview });
		}
	}, [errorFromDataPreview, dataPreview, blockStore]);

	return (
		<article
			className="w-full border rounded-md border-border-smooth"
			title="Python block"
			id={blockUuid}
		>
			<CodeBlock
				wrapperClassName="border-none"
				isLoading={isAnythingLoading}
				lang="python"
				text={code}
			/>

			<CodeOutput isDataPreviewStale={isDataPreviewStale} isSqlBlock={false} />
		</article>
	);
}
