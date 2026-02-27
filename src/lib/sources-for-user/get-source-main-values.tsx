import { removeSourceCitations } from "#/components/Markdown/pre-processors";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { AirtableDescription } from "#/lib/sources-for-user/snippets/airtable-table";
import { ModeDefinitionTitleTrigger } from "#/lib/sources-for-user/snippets/mode-definition";
import { ModeQueryTitleTrigger } from "#/lib/sources-for-user/snippets/mode-query";
import { PdfTitlePopoverTrigger } from "#/lib/sources-for-user/snippets/pdf-title-popover-trigger";
import { SlackConversations } from "#/lib/sources-for-user/snippets/slack-conversation";
import { SqlQueryTitleDialogTrigger } from "#/lib/sources-for-user/snippets/sql-query";
import { SourceMainValuesContainer } from "#/lib/sources-for-user/source-main-values-container";
import { functionThatReturnsNull } from "#/lib/utils";
import {
	AffinitySourceType,
	DocumentType,
	GoogleDriveContentType,
	GoogleDriveSourceType,
	SourceForUserType,
	StandardDocumentContentType,
	StandardDocumentSourceType,
	type AffinityNote,
	type AffinityOrganization,
	type AffinityPerson,
	type AirtableRecord,
	type DataSchemaEntity,
	type ModeDefinitionType,
	type ModeQueryType,
	type PdfSnippet,
	type SlackConversation,
	type SourceID,
	type SQLQueryType,
	type WebsiteSnippet,
	type WebsiteSource,
} from "#/types/chat";
import { DocumentSource } from "#/types/file";

const UNKOWN = "<unknown>" as SourceID;

function makeUnkownValues(
	normalizedSource: NormalizedSource,
): SourceMainValuesContainer<any, any> {
	return new SourceMainValuesContainer<any, any>(
		UNKOWN,
		NaN,
		UNKOWN,
		UNKOWN,
		normalizedSource,
		functionThatReturnsNull,
	);
}

const CLICKUP_LINK = "https://app.clickup.com/";
const CLIKUP_TASK_LINK = `${CLICKUP_LINK}t/`;
const AFFINITY_LINK = "Affinity link";

function getMinimalStandardDocumentValues(
	normalizedSource: Extract<
		NormalizedSource,
		{
			source_type: SourceForUserType.StandardDocument;
			values_type: StandardDocumentSourceType.Minimal;
		}
	>,
): SourceMainValuesContainer<
	SourceForUserType.StandardDocument,
	StandardDocumentSourceType.Minimal
> {
	const { values } = normalizedSource;
	const titleString = removeSourceCitations(values.fields.filename || "");
	const documentSource = values.fields.document_source;
	const documentType = values.fields.document_type;

	let href = values.link;

	assembleHref: if (!href) {
		switch (documentSource) {
			case DocumentSource.Clickup: {
				switch (documentType) {
					case DocumentType.ClickUpTask: {
						const taskId = values.fields.folder_path_ids
							?.findLast((str) => str.startsWith("TASK_"))
							?.replace("TASK_", "");

						if (!taskId) {
							break assembleHref;
						}

						href = `${CLIKUP_TASK_LINK}${taskId}`;

						break assembleHref;
					}

					case DocumentType.ClickUpComment: {
						const taskId = values.fields.folder_path_ids
							?.findLast((str) => str.startsWith("TASK_"))
							?.replace("TASK_", "");

						if (!taskId) {
							break assembleHref;
						}

						const commentId = values.fields.folder_path_ids
							?.findLast((str) => str.startsWith("CLICKUP_COMMENT_"))
							?.replace("CLICKUP_COMMENT_", "");

						if (!commentId) {
							break assembleHref;
						}

						href = `${CLIKUP_TASK_LINK}${taskId}?comment=${commentId}`;

						break assembleHref;
					}

					case DocumentType.ClickUpDocument: {
						const teamId = values.fields.folder_path_ids
							?.find((str) => str.startsWith("WORKSPACE_"))
							?.replace("WORKSPACE_", "");
						const documentId = values.fields.folder_path_ids
							?.find(
								(str) =>
									str.startsWith("DOCUMENT_") &&
									!str.startsWith("DOCUMENT_PAGE_"),
							)
							?.replace("DOCUMENT_", "");
						const documentPage = values.fields.folder_path_ids
							?.findLast((str) => str.startsWith("DOCUMENT_PAGE_"))
							?.replace("DOCUMENT_PAGE_", "");

						href = `${CLICKUP_LINK}${teamId}/docs/${documentId}/${documentPage}`;

						break assembleHref;
					}

					default: {
						const taskId = values.fields.folder_path_ids
							?.findLast((str) => str.startsWith("TASK_"))
							?.replace("TASK_", "");

						href = taskId ? `${CLIKUP_TASK_LINK}${taskId}` : undefined;

						break assembleHref;
					}
				}
			}

			default:
				break;
		}
	}

	return new SourceMainValuesContainer(
		values.id,
		values.relevance,
		titleString,
		removeSourceCitations(values.fields.long_text_data?.join("") || ""),
		normalizedSource,
		() =>
			href ? (
				<Link href={href} title={titleString} />
			) : (
				<Title text={titleString} />
			),
	);
}

function getVerboseStandardDocumentValues(
	normalizedSource: Extract<
		NormalizedSource,
		{
			source_type: SourceForUserType.StandardDocument;
			values_type: StandardDocumentSourceType.Verbose;
		}
	>,
): SourceMainValuesContainer<
	SourceForUserType.StandardDocument,
	StandardDocumentSourceType.Verbose
> {
	const { values } = normalizedSource;
	const descriptionString = removeSourceCitations(
		values.content_list
			?.map((item) =>
				item.type === StandardDocumentContentType.Text ? item.text : "",
			)
			.join("") || "",
	);
	const titleString = `${values.file_name ?? `${values.document_type} file`}`;
	const id = values.id || (`${Math.random()}` as SourceID);

	let href = values.link;

	assembleHref: if (!href) {
		switch (values.document_source) {
			case DocumentSource.Clickup: {
				switch (values.document_type) {
					case DocumentType.ClickUpTask: {
						const taskId = values.folder_path_ids
							?.findLast((str) => str.startsWith("TASK_"))
							?.replace("TASK_", "");

						if (!taskId) {
							break assembleHref;
						}

						href = `${CLIKUP_TASK_LINK}${taskId}`;

						break assembleHref;
					}

					case DocumentType.ClickUpComment: {
						const taskId = values.folder_path_ids
							?.findLast((str) => str.startsWith("TASK_"))
							?.replace("TASK_", "");

						if (!taskId) {
							break assembleHref;
						}

						const commentId = values.folder_path_ids
							?.findLast((str) => str.startsWith("CLICKUP_COMMENT_"))
							?.replace("CLICKUP_COMMENT_", "");

						if (!commentId) {
							break assembleHref;
						}

						href = `${CLIKUP_TASK_LINK}${taskId}?comment=${commentId}`;

						break assembleHref;
					}

					case DocumentType.ClickUpDocument: {
						const teamId = values.folder_path_ids
							?.find((str) => str.startsWith("WORKSPACE_"))
							?.replace("WORKSPACE_", "");

						if (!teamId) {
							break assembleHref;
						}

						const documentId = values.folder_path_ids
							?.find(
								(str) =>
									str.startsWith("DOCUMENT_") &&
									!str.startsWith("DOCUMENT_PAGE_"),
							)
							?.replace("DOCUMENT_", "");

						if (!documentId) {
							break assembleHref;
						}

						const documentPage = values.folder_path_ids
							?.findLast((str) => str.startsWith("DOCUMENT_PAGE_"))
							?.replace("DOCUMENT_PAGE_", "");

						if (!documentPage) {
							break assembleHref;
						}

						href = `${CLICKUP_LINK}${teamId}/docs/${documentId}/${documentPage}`;

						break assembleHref;
					}

					default: {
						const taskIdInPath = values.folder_path_ids
							?.findLast((str) => str.startsWith("TASK_"))
							?.replace("TASK_", "");

						if (!taskIdInPath) {
							break assembleHref;
						}

						href = `${CLIKUP_TASK_LINK}${taskIdInPath}`;

						break assembleHref;
					}
				}
			}

			default:
				break;
		}
	}

	return new SourceMainValuesContainer(
		id,
		NaN,
		titleString,
		descriptionString,
		normalizedSource,
		() =>
			href ? (
				<Link href={href} title={titleString} />
			) : (
				<Title text={titleString} />
			),
	);
}

function Link({ title, href }: { title: string; href: string }) {
	return (
		<a
			className="link hover:underline truncate max-h-full break-all text-left group-data-[is-drawer]/drawer:font-bold group-data-[is-drawer]/drawer:text-base group-data-[is-drawer]/drawer:link"
			rel="noopener noreferrer"
			target="_blank"
			href={href}
		>
			{title}
		</a>
	);
}

function Title({ text }: { text: string }) {
	return <p className="max-h-full break-all truncate">{text}</p>;
}

export function getSourceMainValues(
	normalizedSource: NormalizedSource,
): SourceMainValuesContainer<any, any> {
	switch (normalizedSource.source_type) {
		case SourceForUserType.Website: {
			const values = normalizedSource.values as WebsiteSource;

			return new SourceMainValuesContainer(
				values.identifier,
				NaN,
				values.identifier,
				"",
				normalizedSource,
				() => (
					<Link
						href={values.link ?? values.identifier}
						title={values.identifier}
					/>
				),
			);
		}

		case SourceForUserType.StandardDocument: {
			switch (normalizedSource.values_type) {
				case StandardDocumentSourceType.Minimal: {
					return getMinimalStandardDocumentValues(normalizedSource);
				}

				case StandardDocumentSourceType.Verbose: {
					return getVerboseStandardDocumentValues(normalizedSource);
				}

				default: {
					console.error("Failed to normalize StandardDocument sources:", {
						normalizedSource,
					});

					return makeUnkownValues(normalizedSource);
				}
			}
		}

		case SourceForUserType.GoogleDrive: {
			switch (normalizedSource.values_type) {
				case GoogleDriveSourceType.Minimal: {
					const titleString =
						normalizedSource.values.fields.filename || "File on Google Drive";

					return new SourceMainValuesContainer(
						normalizedSource.values.id || (`${Math.random()}` as SourceID),
						normalizedSource.values.relevance,
						titleString,
						removeSourceCitations(
							normalizedSource.values.fields.long_text_data?.join("") || "",
						),
						normalizedSource,
						() =>
							normalizedSource.values.link ? (
								<Link href={normalizedSource.values.link} title={titleString} />
							) : (
								<Title text={titleString} />
							),
					);
				}

				case GoogleDriveSourceType.Verbose: {
					const titleString = `${normalizedSource.values.file_name ?? "File on Google Drive"}`;

					return new SourceMainValuesContainer(
						normalizedSource.values.id ??
							normalizedSource.values.file_id ??
							(`${Math.random()}` as SourceID),
						normalizedSource.values.calculated_score ?? NaN,
						titleString,
						removeSourceCitations(
							normalizedSource.values.content_list
								.map((item) =>
									item.type === GoogleDriveContentType.Text ? item.text : "",
								)
								.join("") || "",
						),
						normalizedSource,
						() =>
							normalizedSource.values.link ? (
								<Link href={normalizedSource.values.link} title={titleString} />
							) : (
								<Title text={titleString} />
							),
					);
				}

				default: {
					console.warn("Failed to normalize GoogleDrive sources:", {
						normalizedSource,
					});

					return makeUnkownValues(normalizedSource) as any;
				}
			}
		}

		case SourceForUserType.SqlQuery: {
			const values = normalizedSource.values as SQLQueryType;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				values.query,
				removeSourceCitations(values?.description || ""),
				normalizedSource,
				() =>
					values.link ? (
						<Link title={values.description} href={values.link} />
					) : (
						<SqlQueryTitleDialogTrigger
							normalizedSource={normalizedSource}
							titleString={values.query}
						/>
					),
			);
		}

		case SourceForUserType.DataSchema: {
			const values = normalizedSource.values as DataSchemaEntity;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				values.name || "",
				values.database_name || "",
				normalizedSource,
				() =>
					values.link ? (
						<Link title={values.name} href={values.link} />
					) : (
						<Title text={values.name} />
					),
			);
		}

		case SourceForUserType.Airtable: {
			const values = normalizedSource.values as AirtableRecord;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				values.table_name || "",
				values.url || "",
				normalizedSource,
				() => (
					<Link
						href={values.link ?? values.table_name}
						title={values.table_name}
					/>
				),
				() => <AirtableDescription normalizedSource={normalizedSource} />,
			);
		}

		case SourceForUserType.ModeDefinition: {
			const values = normalizedSource.values as ModeDefinitionType;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				values.name || "",
				values.description || "",
				normalizedSource,
				() =>
					values.link ? (
						<Link title={values.query} href={values.link} />
					) : (
						<ModeDefinitionTitleTrigger normalizedSource={normalizedSource} />
					),
			);
		}

		case SourceForUserType.ModeQuery: {
			const values = normalizedSource.values as ModeQueryType;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				values.name || "",
				values.query || "",
				normalizedSource,
				() =>
					values.link ? (
						<Link title={values.query} href={values.link} />
					) : (
						<ModeQueryTitleTrigger normalizedSource={normalizedSource} />
					),
			);
		}

		case SourceForUserType.Slack: {
			const values = normalizedSource.values as SlackConversation;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				values.channel_name || "Slack conversation snippet",
				values.url || "",
				normalizedSource,
				() => (
					<Link
						title={values.channel_name || "Slack conversation snippet"}
						href={values.link || values.url}
					/>
				),
				() => <SlackConversations normalizedSource={normalizedSource} />,
			);
		}

		case SourceForUserType.Pdf: {
			const values = normalizedSource.values as PdfSnippet;

			return new SourceMainValuesContainer<any, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				`${values.pdf_id}` || "",
				values.text || "",
				normalizedSource,
				() =>
					values.link ? (
						<Link title="PDF file snippet" href={values.link} />
					) : (
						<PdfTitlePopoverTrigger normalizedSource={normalizedSource} />
					),
				() => <Title text={values.text.slice(0, 100)} />,
			);
		}

		case SourceForUserType.Web: {
			const values = normalizedSource.values as WebsiteSnippet;

			const description = trimToFirstDoubleNewline(
				values.description || values.text || "",
			);
			const href = values.link || values.url;
			const title =
				values.title || description.slice(0, 200).replaceAll("\n", "") || href;

			return new SourceMainValuesContainer<SourceForUserType.Web, any>(
				values.id || (`${Math.random()}` as SourceID),
				values.relevance ?? NaN,
				href,
				description,
				normalizedSource,
				() => <Link href={href} title={title} />,
			);
		}

		case SourceForUserType.Affinity: {
			if (!normalizedSource.values) {
				return makeUnkownValues(normalizedSource);
			}

			switch (normalizedSource.data_key) {
				case "organizations": {
					const values = normalizedSource.values as AffinityOrganization;

					return new SourceMainValuesContainer<any, any>(
						values.id || (`${Math.random()}` as SourceID),
						values.relevance ?? NaN,
						values.organization_name || "",
						values.long_text_field_data?.[0] || "",
						normalizedSource,
						() =>
							values.link ? (
								<Link
									title={values.organization_name || AFFINITY_LINK}
									href={values.link}
								/>
							) : null,
					);
				}

				case "persons": {
					const values = normalizedSource.values as AffinityPerson;

					return new SourceMainValuesContainer<any, any>(
						values.id || (`${Math.random()}` as SourceID),
						values.relevance ?? NaN,
						values.name || "",
						values.long_text_field_data?.[0] || "",
						normalizedSource,
						() =>
							values.link ? (
								<Link title={values.name || AFFINITY_LINK} href={values.link} />
							) : null,
					);
				}

				case "notes": {
					const values = normalizedSource.values as AffinityNote;

					return new SourceMainValuesContainer<any, any>(
						values.id || (`${Math.random()}` as SourceID),
						values.relevance ?? NaN,
						values.organization_name || "",
						values.note || "",
						normalizedSource,
						() =>
							values.link ? (
								<Link title={values.note || AFFINITY_LINK} href={values.link} />
							) : null,
					);
				}

				case "introductions": {
					switch (normalizedSource.values_type) {
						case AffinitySourceType.AffinityIntroductionsMadeBy: {
							return new SourceMainValuesContainer<any, any>(
								normalizedSource.values.id || (`${Math.random()}` as SourceID),
								normalizedSource.values.relevance ?? NaN,
								normalizedSource.values.person_making_intro_name || "",
								normalizedSource.values.person_making_intro_email?.toLocaleLowerCase() ||
									"",
								normalizedSource,
								() =>
									normalizedSource.values.link ? (
										<Link
											href={normalizedSource.values.link}
											title={AFFINITY_LINK}
										/>
									) : null,
							);
						}

						case AffinitySourceType.AffinityIntroductionsMadeTo: {
							return new SourceMainValuesContainer<any, any>(
								normalizedSource.values.id || (`${Math.random()}` as SourceID),
								normalizedSource.values.relevance ?? NaN,
								normalizedSource.values.person_receiving_intro_name || "",
								normalizedSource.values.person_receiving_intro_email?.toLocaleLowerCase() ||
									"",
								normalizedSource,
								() =>
									normalizedSource.values.link ? (
										<Link
											href={normalizedSource.values.link}
											title={AFFINITY_LINK}
										/>
									) : null,
							);
						}

						default: {
							console.log(
								"Unknown source type. This should have a type to discriminate against.",
								{ normalizedSource },
							);

							return makeUnkownValues(normalizedSource);
						}
					}
				}

				default: {
					console.log("Unknown source type at Affinity source for user.", {
						normalizedSource,
					});

					return makeUnkownValues(normalizedSource);
				}
			}
		}

		default: {
			// assertUnreachable(source.source_type);

			console.log("Unknown source type", { normalizedSource });

			return makeUnkownValues(normalizedSource);
		}
	}
}

function trimToFirstDoubleNewline(text: string): string {
	const delimiter = "\n\n";
	const index = text.indexOf(delimiter);

	if (index === -1) {
		return text;
	}

	// index + 2 to skip over the two '\n' characters
	return text.slice(index + delimiter.length);
}
