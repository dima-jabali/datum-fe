import { memo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import "katex/dist/katex.min.css";

import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";
import { CodeBlock } from "#/components/Markdown/code-block";
import { CsvMarkdownBlock } from "#/components/Markdown/csv-markdown-block";
import {
	normalizeLatexMath,
	preprocessSourceCitations,
	SOURCE_CITATION_LANG_REGEX,
} from "#/components/Markdown/pre-processors";
import { SourceCitation } from "#/components/Markdown/source-citations";
import { Separator } from "#/components/ui/separator";

function LinkForMarkdown({
	children,
	href,
}: React.PropsWithChildren<{ href?: string | undefined }>) {
	if (!href) return children;

	const isEmail = href.includes("@");
	const url = href.startsWith("http")
		? href
		: isEmail
			? href
			: `https://${href}`;

	return (
		<a
			rel={isEmail ? undefined : "noopener noreferrer"}
			target={isEmail ? undefined : "_blank"}
			className="underline link"
			data-markdown-link
			href={url}
		>
			{children}
		</a>
	);
}

const COMPONENTS: Options["components"] = {
	code: (props) => {
		if (props.className?.includes("language-csv")) {
			return <CsvMarkdownBlock csv={`${props.children ?? ""}`} />;
		}

		if (
			typeof props.children === "string" &&
			SOURCE_CITATION_LANG_REGEX.test(props.children)
		) {
			return <SourceCitation text={props.children} />;
		}

		if (props.className?.includes("language-")) {
			return (
				<DefaultSuspenseAndErrorBoundary
					failedText="Failed to render code block!"
					fallbackFor="markdown code block"
				>
					<CodeBlock
						lang={props.className?.replace("language-", "") ?? ""}
						text={`${props.children ?? ""}`}
					/>
				</DefaultSuspenseAndErrorBoundary>
			);
		}

		return (
			<span
				className="bg-muted-strong rounded-md px-1 py-0.5 font-mono font-semibold box-decoration-slice"
				data-markdown-code-inline
			>
				{props.children}
			</span>
		);
	},
	link: LinkForMarkdown,
	a: LinkForMarkdown,
	table: ({ children }) => (
		<div className="simple-scrollbar my-4 text-xs">
			<table className="border border-border-smooth">{children}</table>
		</div>
	),
	th: ({ children }) => (
		<th className="whitespace-nowrap py-2 px-4">{children}</th>
	),
	td: ({ children }) => <td className="py-0.5 px-4">{children}</td>,
	thead: ({ children }) => <thead className="bg-muted/20">{children}</thead>,
	tbody: ({ children }) => (
		<tbody className="divide-y divide-border-smooth">{children}</tbody>
	),
	p: ({ children }) => <p className="my-4 first:mt-0 last:mb-0">{children}</p>,
	hr: Separator,
	h1: ({ children }) => (
		<h1 className="mt-6 mb-2 font-semibold text-3xl">{children}</h1>
	),
	h2: ({ children }) => (
		<h2 className="mt-6 mb-2 font-semibold text-2xl">{children}</h2>
	),
	h3: ({ children }) => (
		<h2 className="mt-6 mb-2 font-semibold text-xl">{children}</h2>
	),
	h4: ({ children }) => (
		<h2 className="mt-6 mb-2 font-semibold text-lg">{children}</h2>
	),
	h5: ({ children }) => (
		<h2 className="mt-6 mb-2 font-semibold text-base">{children}</h2>
	),
	h6: ({ children }) => (
		<h2 className="mt-6 mb-2 font-semibold text-sm">{children}</h2>
	),
	ol: ({ children }) => (
		<ol className="ml-5 list-decimal whitespace-normal list-inside">
			{children}
		</ol>
	),
	ul: ({ children }) => (
		<ul className="ml-5 list-disc whitespace-normal list-inside">{children}</ul>
	),
	li: ({ children }) => <li className="py-1 [&>p]:inline">{children}</li>,
	blockquote: ({ children }) => (
		<blockquote className="my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic">
			{children}
		</blockquote>
	),
	sup: ({ children }) => <sup className="text-sm">{children}</sup>,
	sub: ({ children }) => <sub className="text-sm">{children}</sub>,
};

const REMARK_PLUGINS: Options["remarkPlugins"] = [remarkGfm, remarkMath];
const REHYPE_PLUGINS: Options["rehypePlugins"] = [rehypeKatex];

export const Markdown = memo(function Markdown({
	alignTextToRight = false,
	text,
}: {
	alignTextToRight?: boolean;
	text: string;
}) {
	const transformedText = normalizeLatexMath(preprocessSourceCitations(text));

	return (
		<div className="w-full data-[align-text-to-right=true]:text-right *:box-border box-border text-xs @md:text-sm! @lg:text-base!">
			<ReactMarkdown
				data-align-text-to-right={alignTextToRight}
				rehypePlugins={REHYPE_PLUGINS}
				remarkPlugins={REMARK_PLUGINS}
				components={COMPONENTS}
				data-markdown
			>
				{transformedText}
			</ReactMarkdown>
		</div>
	);
});
