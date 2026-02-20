import type { Tagged } from "type-fest";

import type {
	AwsBucket,
	AwsKey,
	ISODateString,
	Nullable,
} from "#/types/general";
import type { User } from "#/types/user";

export enum GeneralFileType {
	GOOGLE_DRIVE_DOCUMENT = "google_drive_document",
	GOOGLE_DRIVE_FOLDER = "google_drive_folder",
	GENERAL = "GENERAL",
	FOLDER = "FOLDER",
	IMAGE = "IMAGE",
	DOCX = "DOCX",
	XLSX = "XLSX",
	PPTX = "PPTX",
	JPEG = "JPEG",
	TIFF = "TIFF",
	HEIF = "HEIF",
	HEIC = "HEIC",
	PNG = "PNG",
	CSV = "CSV",
	PDF = "PDF",
}

export enum GeneralFileIndexStatus {
	PARSING_UNSTRUCTURED_DATA = "PARSING_UNSTRUCTURED_DATA",
	PROCESSING_COMPLETE = "PROCESSING_COMPLETE",
	SUMMARIZING_TEXT = "SUMMARIZING_TEXT",
	INDEXING_TEXT = "INDEXING_TEXT",
	STORING_TEXT = "STORING_TEXT",
	NOT_STARTED = "NOT_STARTED",
}

export type GeneralFile = Nullable<{
	search_fields: Array<Record<string, string>>;
	filter_fields: Array<Record<string, string>>;
	index_status: GeneralFileIndexStatus;
	folder_hierarchy: Array<string>;
	document_source: DocumentSource;
	last_index_start: ISODateString;
	last_indexed: ISODateString;
	created_at: ISODateString;
	updated_at: ISODateString;
	last_index_error: string;
	file_size_bytes: number;
	presigned_url: string;
	aws_bucket: AwsBucket;
	description: string;
	file_name: string;
	created_by: User;
	aws_key: AwsKey;
	summary: string;
	title: string;
	uuid: string;
}> & {
	type: GeneralFileType;
	id: FileId;
};

export type GoogleDriveDatabaseConnectionId = Tagged<
	string,
	"GoogleDriveDatabaseConnectionId"
>;
export type GoogleDriveFileId = Tagged<string, "GoogleDriveFileId">;
export type FileId = Tagged<number, "FileId">;

export type GoogleDriveFile = GeneralFile & {
	google_drive_connection_id: GoogleDriveDatabaseConnectionId;
	document_source: DocumentSource.GOOGLE_DRIVE;
	parents: Array<GoogleDriveFileId>;
	file_id: GoogleDriveFileId;
	google_drive_url: string;
	mime_type: string;
};

export enum DocumentSource {
	GOOGLE_DRIVE = "GOOGLE_DRIVE",
	BB_UPLOAD = "BB_UPLOAD",
	Clickup = "CLICKUP",
	CIRCLE = "CIRCLE",
}

export enum IndexingFileStep {
	PARSING_UNSTRUCTURED_DATA = "PARSING_UNSTRUCTURED_DATA",
	SUMMARIZING_TEXT = "SUMMARIZING_TEXT",
	NOT_STARTED = "NOT_STARTED",
}

export enum IndexingFileStatus {
	ParsingUnstructuredData = "Parsing Unstructured Data",
	ProcessingComplete = "Processing Complete",
	SummarizingText = "Summarizing Text",
	IndexingText = "Indexing Text",
	StoringText = "Storing Text",
	NotStarted = "Not Started",
}
