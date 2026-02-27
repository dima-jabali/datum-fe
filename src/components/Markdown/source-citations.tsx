import { Link } from "lucide-react";
import { memo, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import {
	URL_TEXT_SEARCH,
	WEBSITE_PREFIX,
} from "#/components/Markdown/pre-processors";
import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import { generalCtx, type GeneralCtxData } from "#/contexts/general/ctx";
import { useGetUrlPreview } from "#/hooks/get/use-get-url-preview";
import { matchIcon } from "#/icons/match-icon";
import type { SourceMainValuesContainer } from "#/lib/sources-for-user/source-main-values-container";
import { log } from "#/lib/utils";
import { SourceForUserType, type SourceID } from "#/types/chat";
import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";

type Props = {
	text: string;
};

const REGEX_OF_TEXT_TO_BE_REPLACED =
	/(^\s+)|(\s+$)|(source-citation)|(WEBSITE:)|(SOURCE:)|\n/g;

function searchForPartialMatch(
	sourceId: SourceID,
	sourcesMainValues: GeneralCtxData["sourcesMainValues"],
): SourceMainValuesContainer<any, any> | undefined {
	if (sourcesMainValues.size === 0) {
		return undefined;
	}

	if (sourcesMainValues.has(sourceId)) {
		return sourcesMainValues.get(sourceId);
	}

	sourceId = sourceId.replace(WEBSITE_PREFIX, "") as SourceID;

	let matchedSource: SourceMainValuesContainer<any, any> | undefined =
		undefined;

	for (const sourceMainValues of sourcesMainValues.values()) {
		if (sourceMainValues.id.startsWith(sourceId) || sourceMainValues.id.replace(URL_TEXT_SEARCH, "") === sourceId) {
			log("Partial match found", {
				sourceMainValues,
				sourceId,
			});

			matchedSource = sourceMainValues;

			break;
		}
	}

	return matchedSource;
}

export const SourceCitation = memo(function SourceCitation({text}: Props) {

	const [isOpen, setIsOpen] = useState(false);

	const sourcesMainValues = generalCtx.use.sourcesMainValues();

	const parsedId = useMemo(() => {
		REGEX_OF_TEXT_TO_BE_REPLACED.lastIndex = 0;
		const parsedId = text.replaceAll(
			REGEX_OF_TEXT_TO_BE_REPLACED,
			"",
		) as SourceID;
		
		return parsedId;
	}, [text])
	
	

	const source = useMemo(
		() => searchForPartialMatch(parsedId, sourcesMainValues),
		[parsedId, sourcesMainValues],
	);

	if (!source) {
		log("Source not found", { parsedId, sourcesMainValues });

		return <button
		className="py-1 px-2 mx-0.5 bg-primary/10 rounded-xl inline-block flex-none cursor-not-allowed"
		title={`Source not found (${parsedId})`}
	>
		<Link className="size-3 flex-none stroke-primary/50" />
	</button>;
	}

	const {
		normalizedSource: { source_type },
		descriptionString,
		descriptionJSX,
		titleString,
	} = source;
	const isWebsite = source_type === SourceForUserType.Website;

	return (
		<NativePopover onOpenChange={setIsOpen} isOpen={isOpen}>
			<NativePopoverTrigger
				className="button-hover flex-none py-1 px-2 mx-0.5 bg-primary/15 rounded-xl"
				title="Source citation (click to show source)"
				data-source-citation
			>
				<Link className="size-3 flex-none stroke-primary" />
			</NativePopoverTrigger>

			{isOpen ? (
				<NativePopoverContent
					className="w-72 max-h-72 p-0 mobile:p-0 text-xs mobile:w-[90dvw] gap-0"
					position="top"
				>
					<header className="flex items-center justify-between gap-3 w-full p-2">
						{isWebsite ? (
							<a
								className="link hover:underline truncate max-h-full break-all text-left group-data-[is-drawer]/drawer:font-bold group-data-[is-drawer]/drawer:text-base group-data-[is-drawer]/drawer:link"
								rel="noopener noreferrer"
								href={titleString}
								target="_blank"
							>
								{titleString}
							</a>
						) : (
							<p
								className="truncate font-bold text-primary"
								title={titleString}
							>
								{titleString}
							</p>
						)}

						{matchIcon(source_type, "size-4")}
					</header>

					<hr className="border-border-smooth" />

					{isWebsite ? (
						<DefaultSuspenseAndErrorBoundary
							failedText="Failed to fetch website preview"
							fallbackClassName="min-h-[4lh]"
							fallbackFor="website-preview"
						>
							<WebPreview url={titleString} />
						</DefaultSuspenseAndErrorBoundary>
					) : descriptionJSX ? (
						<div className="p-2 simple-scrollbar">{descriptionJSX}</div>
					) : (
						<article className="simple-scrollbar w-full h-full max-h-full p-2 flex flex-col gap-1 wrap-anywhere">
							<ReactMarkdown>{descriptionString}</ReactMarkdown>
						</article>
					)}
				</NativePopoverContent>
			) : null}
		</NativePopover>
	);

});

function WebPreview({ url }: { url: string }) {
	const websitePreviewData = useGetUrlPreview(url);

	const img = websitePreviewData.images?.[0] || websitePreviewData.favicons?.[0];
	const description = websitePreviewData.description || "";
	const siteName = websitePreviewData.siteName || "";
	const title = websitePreviewData.title || url;

	log({websitePreviewData})

	return (
		<div className="flex flex-col gap-2 min-h-[4lh] p-2">
			<div className="flex gap-2 items-center">
				<strong>
					{siteName ? `${siteName} — ` : ""}
					{title}
				</strong>

				{img?<img className="object-cover h-full max-w-[40%] rounded-md" src={img} />:null}
			</div>

			<p className="text-muted">{description}</p>
		</div>
	);
}
