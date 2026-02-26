import {
	anyOf,
	createRegExp,
	exactly,
	global,
	maybe,
	whitespace,
} from "magic-regexp";

// Test cases
// [**SOURCE:id:google_drive:google_drive::google_sheet_column_596243cd3e3042b3b1f1a82b6e6f3918**]
export const SOURCE_CITATIONS_REGEX =
	/\[(?:\s*|\**)(?:SOURCE:|WEBSITE:)(.*?)(?:\**)\]/gi;

export const SOURCE_CITATION_LANG_REGEX = /^(\s*)source-citation/;
export const SOURCE_CITATION_LANG = "source-citation";
export const URL_TEXT_SEARCH = /#:~:text=(.*)/;
const LATEX_MATH_REGEX = /\\\[(.*?)\\\]/gs;
export const WEBSITE_PREFIX = "WEBSITE:";

export const SPLIT_SOURCES_REGEX = createRegExp(
	maybe(whitespace)
		.and(maybe(anyOf(",", ";")))
		.and(maybe(whitespace))
		.and(exactly(anyOf("SOURCE:", "WEBSITE:", "SOURCE:WEBSITE:"))),

	[global],
);

export function preprocessSourceCitations(content: string) {
	SOURCE_CITATIONS_REGEX.lastIndex = 0;

	// Replace source citations with inline code blocks so we can parse them later
	const processedContent = content.replaceAll(
		SOURCE_CITATIONS_REGEX,
		(_, source: string) => {
			const split = source.split(SPLIT_SOURCES_REGEX).filter(Boolean);

			const result = split
				.map((source) => {
					const possibleUrlWithoutHash = removeUrlHash(source);

					return `\uFEFF\`${SOURCE_CITATION_LANG}${possibleUrlWithoutHash}\`\uFEFF`;
				})
				.join("");

			return result;
		},
	);

	return processedContent;
}

export function removeSourceCitations(content: string) {
	SOURCE_CITATIONS_REGEX.lastIndex = 0;

	return content.replaceAll(SOURCE_CITATIONS_REGEX, "");
}

export function normalizeLatexMath(source: string) {
	LATEX_MATH_REGEX.lastIndex = 0;

	return source.replace(
		LATEX_MATH_REGEX,
		(_, content) => `$$\n${content.trim()}\n$$`,
	);
}

export function removeUrlHash(maybeUrl: string): string {
	const parsedUrl = URL.parse(maybeUrl);

	if (parsedUrl === null) {
		return maybeUrl;
	}

	parsedUrl.hash = "";

	return parsedUrl.href;
}
