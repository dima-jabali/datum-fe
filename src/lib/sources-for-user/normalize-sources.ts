import type {
	AffinityIntroductionsMadeBy,
	AffinityIntroductionsMadeTo,
	AffinityNote,
	AffinityOrganization,
	AffinityPerson,
	AffinitySourceType,
	AirtableRecord,
	DataSchemaEntity,
	GoogleDriveMinimalSource,
	GoogleDriveSourceType,
	MinimalStandardDocumentSourceValues,
	ModeDefinitionType,
	ModeQueryType,
	PdfSnippet,
	SlackConversation,
	SourceForUser,
	SourceForUserType,
	SQLQueryType,
	StandardDocumentSourceType,
	GoogleDriveVerboseSource,
	VerboseStandardDocumentSourceValues,
	WebsiteSnippet,
	WebsiteSource,
} from "#/types/chat";

export type NormalizedSource = {
	relevance: number;
} & (
	| {
			source_type: SourceForUserType.GoogleDrive;
			values_type: GoogleDriveSourceType.Minimal;
			values: GoogleDriveMinimalSource;
			data_key: string;
	  }
	| {
			source_type: SourceForUserType.GoogleDrive;
			values_type: GoogleDriveSourceType.Verbose;
			values: GoogleDriveVerboseSource;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			values_type: AffinitySourceType.AffinityOrganization;
			source_type: SourceForUserType.Affinity;
			values: AffinityOrganization;
			data_key: "organizations";
	  }
	| {
			values_type: AffinitySourceType.AffinityNote;
			source_type: SourceForUserType.Affinity;
			values: AffinityNote;
			data_key: "notes";
	  }
	| {
			values_type: AffinitySourceType.AffinityPerson;
			source_type: SourceForUserType.Affinity;
			values: AffinityPerson;
			data_key: "persons";
	  }
	| {
			values_type: AffinitySourceType.AffinityIntroductionsMadeBy;
			source_type: SourceForUserType.Affinity;
			values: AffinityIntroductionsMadeBy;
			data_key: "introductions";
	  }
	| {
			values_type: AffinitySourceType.AffinityIntroductionsMadeTo;
			source_type: SourceForUserType.Affinity;
			values: AffinityIntroductionsMadeTo;
			data_key: "introductions";
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.StandardDocument;
			values_type: StandardDocumentSourceType.Minimal;
			values: MinimalStandardDocumentSourceValues;
			data_key: string;
	  }
	| {
			source_type: SourceForUserType.StandardDocument;
			values_type: StandardDocumentSourceType.Verbose;
			values: VerboseStandardDocumentSourceValues;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.Web;
			values: WebsiteSnippet;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.Pdf;
			values: PdfSnippet;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.Slack;
			values: SlackConversation;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.ModeQuery;
			values: ModeQueryType;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.ModeDefinition;
			values: ModeDefinitionType;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.DataSchema;
			values: DataSchemaEntity;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.Airtable;
			values: AirtableRecord;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.SqlQuery;
			values: SQLQueryType;
			values_type: never;
			data_key: string;
	  }
	//////////////////////////////////////////////
	| {
			source_type: SourceForUserType.Website;
			values_type: undefined;
			values: WebsiteSource;
			data_key: string;
	  }
);
//////////////////////////////////////////////
// | {
// 		values: Record<string, unknown>;
// 		source_type: SourceForUserType;
// 		values_type: undefined;
// 		data_key: string;
//   }

export function normalizeSources(
	sources: ReadonlyArray<SourceForUser>,
): Array<NormalizedSource> {
	return sources.flatMap((source) => {
		try {
			let _key = ""; // For legacy reasons. Old sources don't have the `data_key` key.

			{
				/** For legacy reasons. Old sources don't have the `data_key` key. */

				for (const key in source.source_info) {
					if (key === "type") continue;

					_key = key;

					break;
				}
			}

			const arrayOfValues = Reflect.get(
				source.source_info,
				source.data_key || _key,
			);

			if (Array.isArray(arrayOfValues)) {
				// @ts-expect-error => Don't know what's this error is about, but ignoring it for now. :|
				const normalized: Array<NormalizedSource> = arrayOfValues.map(
					(item) => ({
						relevance: (item.relevance as number) ?? 0,
						values_type: source.source_info.type,
						source_type: source.source_type,
						data_key: source.data_key,
						values: item,
					}),
				);

				return normalized;
			}

			console.error("Failed to normalize sources:", { source, arrayOfValues });

			return [];
		} catch (error) {
			console.error("Failed to normalize sources:", { source, error });

			return [];
		}
	});
}
