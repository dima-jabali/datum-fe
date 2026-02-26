import { Link } from "lucide-react";
import { memo } from "react";

import {
	useSourceCitationContextStore,
	type SourceID,
} from "#/contexts/source-citation/context";
import { isDev, log } from "#/lib/utils";

const REGEX_OF_TEXT_TO_BE_REPLACED =
	/(^\s+)|(\s+$)|(source-citation)|(WEBSITE:)|(SOURCE:)|\n/g;

export const SourceCitation = memo(function SourceCitation({
	text,
}: {
	text: string;
}) {
	const sourceCitationStore = useSourceCitationContextStore();

	REGEX_OF_TEXT_TO_BE_REPLACED.lastIndex = 0;
	const parsedId = text.replaceAll(
		REGEX_OF_TEXT_TO_BE_REPLACED,
		"",
	) as SourceID;

	const state = sourceCitationStore.getState();
	const { allNormalizedSourcesWithId } = state;

	const citationNumber = allNormalizedSourcesWithId.get(parsedId);

	if (citationNumber === undefined) {
		if (isDev) {
			log("Source citation not found:", { parsedId, text });
			console.log({ allNormalizedSourcesWithId });
		}

		return (
			<span
				className="py-1 px-2 mx-0.5 bg-primary/10 rounded-xl inline-block flex-none cursor-not-allowed"
				title={`Source not found: ${parsedId}`}
			>
				<Link className="size-3 flex-none stroke-primary/50" />
			</span>
		);
	}

	function handleShowSource() {
		sourceCitationStore.setState({ currentSourceId: parsedId });
	}

	return (
		<button
			className="data-[has-onclick=true]:button-hover flex-none py-1 px-2 mx-0.5 bg-primary/15 rounded-xl inline-block"
			title="Source citation (click to show source)"
			onClick={handleShowSource}
			data-source-citation
			type="button"
		>
			<Link className="size-3 flex-none stroke-primary" />
		</button>
	);
});
