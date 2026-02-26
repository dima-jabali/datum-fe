import AnsiToReact from "ansi-to-react";
import parseHTML from "html-react-parser";
import { BoltIcon, CircleAlert, Sparkles } from "lucide-react";
import { Fragment, memo } from "react";

import { useBlockStore } from "#/contexts/block-context";
import { useFixPython } from "#/hooks/mutation/use-fix-python";
import { useFixSql } from "#/hooks/mutation/use-fix-sql";
import { KernelResultsTypes } from "#/types/notebook";

type Props = {
	isDataPreviewStale: boolean;
	isSqlBlock: boolean;
};

export const CodeOutput = memo(function CodeOutput({
	isDataPreviewStale,
	isSqlBlock,
}: Props) {
	const blockStore = useBlockStore();

	const kernelResults = blockStore.use.kernelResults();
	const fixPython = useFixPython();
	const fixSql = useFixSql();

	if (kernelResults.length === 0) return null;

	function handleFix() {
		if (isSqlBlock) {
			if (fixSql.isPending) return;

			fixSql.mutate();
		} else {
			if (fixPython.isPending) return;

			fixPython.mutate();
		}
	}

	const kernelOutput = kernelResults.map((kernelResult, resultIndex) => {
		switch (kernelResult.type) {
			case KernelResultsTypes.TEXT: {
				const lines = kernelResult.value.split("\n");

				return (
					<Fragment key={resultIndex}>
						{lines.map((line, lineIndex) => (
							<pre
								className="whitespace-pre-wrap px-4 leading-[1.5rem] empty:min-h-6"
								data-line-number={lineIndex + 1}
								key={lineIndex}
							>
								{line}
							</pre>
						))}
					</Fragment>
				);
			}

			case KernelResultsTypes.TEXT_HTML: {
				const parsedHtml = parseHTML(kernelResult.value);

				return (
					<div data-parse-html-results key={resultIndex}>
						{parsedHtml}
					</div>
				);
			}

			case KernelResultsTypes.ERROR: {
				return (
					<article
						className="flex w-full flex-col gap-1 border border-destructive p-4"
						key={resultIndex}
					>
						<header className="flex items-center gap-2">
							<CircleAlert className="size-7 text-destructive" />

							<p className="text-sm font-bold">
								Your code could not be executed
							</p>

							<button
								className="ml-auto flex items-center gap-3 rounded-full border border-white p-1 pl-3 pr-4 hover:bg-white/10 active:bg-white/20"
								onClick={handleFix}
							>
								<Sparkles className="size-5 stroke-1" />

								<p>Fix it</p>
							</button>
						</header>

						<p className="pb-6 pl-[2.375rem]">
							We received the following error when executing the code above:
						</p>

						<AnsiToReact className="whitespace-pre-wrap text-base font-bold leading-[1.5rem]">
							{kernelResult.value}
						</AnsiToReact>
					</article>
				);
			}

			case KernelResultsTypes.IMAGE: {
				const imageSrc = `data:image/png;base64,${kernelResult.value}`;

				return <img key={resultIndex} src={imageSrc} alt="" />;
			}

			case KernelResultsTypes.REACT_NODE: {
				if (kernelResult.reactNode) {
					return (
						<Fragment key={resultIndex}>{kernelResult.reactNode}</Fragment>
					);
				} else {
					console.info("No ReactNode found!", { kernelResult });

					return null;
				}
			}

			case KernelResultsTypes.FIXED_PYTHON:
			case KernelResultsTypes.FIXED_SQL: {
				return (
					<article
						className="flex w-full flex-col gap-4 border border-blue-400 p-4"
						key={resultIndex}
					>
						<div className="flex items-center gap-4">
							<BoltIcon className="size-6 fill-yellow-400" />

							<p className="text-sm font-bold tracking-wider">
								Here&apos;s your fixed code!
							</p>
						</div>

						<p className="tracking-wide">
							Try running it again and if it still doesn&apos;t work, you can
							keep fixing it!
						</p>
					</article>
				);
			}

			default: {
				console.error("Unknown data type:", { kernelResult });

				return null;
			}
		}
	});

	return (
		<div className="simple-scrollbar flex h-(--block-height) flex-col max-h-(--block-height) overflow-y-auto overflow-x-hidden border-t border-border-smooth bg-black p-4 text-sm leading-normal text-white subpixel-antialiased scrollbar-stable gap-4">
			{isDataPreviewStale ? (
				<span
					className="text-blue-100 w-fit rounded-full text-xs px-2 py-0.5 bg-blue-500"
					title="This data preview does not match what is on the editor."
				>
					This data preview is stale
				</span>
			) : null}

			<div className="text-xs font-mono">{kernelOutput}</div>
		</div>
	);
});
