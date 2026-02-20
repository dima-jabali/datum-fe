import type { Tagged } from "type-fest";

import { createZustandProvider } from "#/contexts/create-zustand-provider";

type SourceCitationIdsMap = Map<
	SourceID | CitationNumber,
	CitationNumber | SourceID
>;
export type CitationNumber = Tagged<number, "CitationNumber">;
export type SourceID = Tagged<string, "SourceID">;

export type SourceCitationsData = {
	allNormalizedSourcesWithId: SourceCitationIdsMap;
	lastCitationNumber: CitationNumber;
	currentSourceId: SourceID;
};

export const {
	Provider: __SourceCitationContextProvider,
	useStore: useSourceCitationContextStore,
} = createZustandProvider<SourceCitationsData>(
	() => ({
		lastCitationNumber: 0 as CitationNumber,
		allNormalizedSourcesWithId: new Map(),
		currentSourceId: "" as SourceID,
	}),
	{
		name: "SourceCitationContext",
		shallowComparison: true,
	},
);
