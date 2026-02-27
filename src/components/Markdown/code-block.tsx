import { memo } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { CopyButton } from "#/components/Markdown/copy-button";
import { LOADER } from "#/components/loader";
import { cn } from "#/lib/utils";

type Props = {
	wrapperClassName?: string;
	isLoading?: boolean;
	text: string;
	lang: string;
};

export const CodeBlock = memo(function CodeBlock({
	wrapperClassName,
	isLoading,
	text,
	lang,
}: Props) {
	return (
		<div
			className={cn(
				"flex flex-col border rounded-md border-border-smooth w-full max-w-full overflow-hidden",
				wrapperClassName,
			)}
			data-markdown-code-block-lang={lang}
		>
			<header className="bg-muted-strong p-0.5 text-xs flex items-center justify-between border-b border-border-smooth">
				<span
					className="text-primary font-mono pl-2 capitalize py-1 px-2 rounded-sm"
					title="Programming Language"
				>
					{lang}
				</span>

				<div className="flex items-center gap-2">
					<CopyButton text={text} />

					{isLoading ? LOADER : null}
				</div>
			</header>

			<div className="font-mono *:!my-0 *:!p-2 text-sm *:min-h-[4lh]">
				{isLoading ? (
					<pre>
						<code>{text}</code>
					</pre>
				) : (
					<SyntaxHighlighter style={oneLight} language={lang} wrapLines>
						{text}
					</SyntaxHighlighter>
				)}
			</div>
		</div>
	);
});
