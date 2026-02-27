import {
	GoogleDriveSourceType,
	SourceForUserType,
	StandardDocumentSourceType,
} from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { AirtableTable } from "#/lib/sources-for-user/snippets/airtable-table";
import {
	GoogleDriveMinimalDetails,
	GoogleDriveVerboseDetails,
} from "#/lib/sources-for-user/snippets/google-drive";
import {
	StandardDocumentMinimalDetails,
	StandardDocumentVerboseDetails,
} from "#/lib/sources-for-user/snippets/standard-document";
import { WebDescription } from "#/lib/sources-for-user/snippets/web-description";
import type { SourceMainValuesContainer } from "#/lib/sources-for-user/source-main-values-container";

export function getExtraInfo(
	sourceMainValues: SourceMainValuesContainer<
		SourceForUserType,
		NormalizedSource["values_type"]
	>,
) {
	switch (sourceMainValues.normalizedSource.source_type) {
		case SourceForUserType.Airtable:
			return (
				<AirtableTable normalizedSource={sourceMainValues.normalizedSource} />
			);

		case SourceForUserType.DataSchema:
			return null;

		case SourceForUserType.Web:
			return (
				<WebDescription normalizedSource={sourceMainValues.normalizedSource} />
			);

		case SourceForUserType.GoogleDrive: {
			switch (sourceMainValues.normalizedSource.values_type) {
				case GoogleDriveSourceType.Minimal:
					return (
						<GoogleDriveMinimalDetails
							normalizedSource={sourceMainValues.normalizedSource}
						/>
					);

				case GoogleDriveSourceType.Verbose:
					return (
						<GoogleDriveVerboseDetails
							normalizedSource={sourceMainValues.normalizedSource}
						/>
					);

				default:
					return null;
			}
		}

		case SourceForUserType.StandardDocument: {
			switch (sourceMainValues.normalizedSource.values_type) {
				case StandardDocumentSourceType.Minimal:
					return (
						<StandardDocumentMinimalDetails
							normalizedSource={sourceMainValues.normalizedSource}
						/>
					);

				case StandardDocumentSourceType.Verbose:
					return (
						<StandardDocumentVerboseDetails
							normalizedSource={sourceMainValues.normalizedSource}
						/>
					);

				default:
					return null;
			}
		}

		default:
			return null;
	}
}
