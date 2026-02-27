import type { Tagged } from "type-fest";

import type { DatabaseConnectionType } from "#/types/databases";
import type { GeneralFileType } from "#/types/file";
import type {
	AwsBucket,
	AwsKey,
	ISODateString,
	Nullable,
} from "#/types/general";
import type {
	BotConversationId,
	NotebookBlockUuid,
	PdfId,
} from "#/types/notebook";
import type { User } from "#/types/user";

export type SourceID = Tagged<string, "SourceID">;

export enum BotConversationMessageSenderType {
	User = "USER",
	AI = "AI",
}

export enum BotConversationMessageType {
	Notebook_Block_User_Image_Message = "NOTEBOOK_BLOCK_USER_IMAGE_MESSAGE",
	Plan_Next_Step_Response = "PLAN_NEXT_STEP_RESPONSE",
	Notebook_Block_Message = "NOTEBOOK_BLOCK_MESSAGE",
	Refining_Plan_Message = "REFINING_PLAN_MESSAGE",
	User_Message = "USER_MESSAGE",
	AI_Response = "AI_RESPONSE",
}

export enum BotConversationMessageStatus {
	InProgress = "IN_PROGRESS",
	Complete = "COMPLETE",
	Error = "ERROR",
}

export type BotConversationMessageUuid = Tagged<
	string,
	"BotConversationMessageUuid"
>;
export type BotConversationMessageId = Tagged<
	number,
	"BotConversationMessageId"
>;
export type ParallelConversationId = Tagged<number, "ParallelConversationId">;

export type BotConversationMessage = {
	parallel_conversation_id: ParallelConversationId | null;
	message_status?: BotConversationMessageStatus;
	bot_conversation: { id: BotConversationId };
	sub_conversation_uuids: (string | null)[];
	block: { uuid: NotebookBlockUuid } | null;
	show_as_intermediate_step?: boolean;
	uuid: BotConversationMessageUuid;
	sources: SourceForUser[] | null;
	order_by_timestamp_ms: number;
	id: BotConversationMessageId;
	toggle_text?: string | null;
	thumbs_up: boolean | null;
	created_at: ISODateString;
	updated_at: ISODateString;
	visible_to_model: boolean;
	visible_to_user: boolean;
	text: string | null;
	transient: boolean;
	archived: boolean;
	sender: {
		sender_type: BotConversationMessageSenderType;
		sender_info: User | null;
	};
} & (
	| {
			message_type: BotConversationMessageType.Plan_Next_Step_Response;
			json: PlanNextStepJson;
	  }
	| {
			message_type: BotConversationMessageType.Notebook_Block_User_Image_Message;
			block: { uuid: NotebookBlockUuid };
			json: null;
	  }
	| {
			message_type:
				| BotConversationMessageType.Notebook_Block_Message
				| BotConversationMessageType.Refining_Plan_Message
				| BotConversationMessageType.User_Message
				| BotConversationMessageType.AI_Response;
			json: null | undefined;
	  }
);

export type PlanNextStepJson = {
	action_type: string;
	reasoning: string;
};

// ---------- SourceForUser

export enum SourceForUserType {
	StandardDocument = "STANDARD_DOCUMENT",
	ModeDefinition = "MODE_DEFINITION",
	MetabaseCard = "METABASE_CARD",
	GoogleDrive = "GOOGLE_DRIVE",
	DataSchema = "DATA_SCHEMA",
	ModeQuery = "MODE_QUERY",
	SqlQuery = "SQL_QUERY",
	Affinity = "AFFINITY",
	Airtable = "AIRTABLE",
	Website = "WEBSITE",
	Slack = "SLACK",
	Pdf = "PDF",
	Web = "WEB",
}

export type SourceForUser =
	| StandardDocumentSourcesForUser
	| ModeDefinitionSourceForUser
	| GoogleDriveSourcesForUser
	| DataSchemaSourceForUser
	| ModeQuerySourceForUser
	| WebsitesSourcesForUser
	| AffinitySourceForUser
	| AirtableSourceForUser
	| SQLQuerySourceForUser
	| SlackSourceForUser
	| PDFSourceForUser
	| WebSourceForUser;

type WebsitesSourcesForUser = {
	source_type: SourceForUserType.Website;
	data_key: string;
	source_info: {
		websites: Array<WebsiteSource>;
		type: never;
	};
};

export type WebsiteSource = {
	identifier: SourceID;
	type: "WEBSITE";
	link?: string;
};

type StandardDocumentSourcesForUser = {
	source_type: SourceForUserType.StandardDocument;
	data_key: string;
	source_info:
		| {
				documents: Array<MinimalStandardDocumentSourceValues>;
				type: StandardDocumentSourceType.Minimal;
		  }
		| {
				documents: VerboseStandardDocumentSourceValues;
				type: StandardDocumentSourceType.Verbose;
		  };
};

export enum DocumentType {
	ClickUpDocument = "CLICKUP_DOCUMENT",
	ClickUpComment = "CLICKUP_COMMENT",
	ClickUpTask = "CLICKUP_TASK",
}

export enum DocumentSubtype {
	ClickupTaskAttachment = "CLICKUP_TASK_ATTACHMENT",
}

enum DocumentSource {
	GOOGLE_DRIVE = "GOOGLE_DRIVE",
	BB_UPLOAD = "BB_UPLOAD",
	Clickup = "CLICKUP",
	CIRCLE = "CIRCLE",
}

export const DOCUMENT_TYPES = Object.values(DocumentType);

export type MinimalStandardDocumentSourceValues = {
	relevance: number;
	link?: string;
	id: SourceID;
	fields: {
		long_text_data: Array<string> | undefined;
		is_image_useful: string;
		document_uuid: string;
		image_aws_key: string;
		is_table_root: string;
		page_number?: number;
		chunk_id: string;
		filename: string;
		group_id: string;

		document_type?: DocumentType | GeneralFileType;
		matchfeatures?: Record<string, unknown>;
		document_subtype?: DocumentSubtype;
		document_source?: DocumentSource;
		folder_path_ids?: Array<string>;
		document_created_at?: number;
		folder_path?: Array<string>;
		is_number_only?: boolean;
		documentid?: string; // "id:standard_document:standard_document::development_DOCUMENT_PAGE_182rzx-292940_1"
		image_uuid?: string;
		sddocname?: string;
		source_id?: string;
		version?: number;
		schema?: string;
		name?: string;
		id?: string;
	};
};

export enum StandardDocumentContentType {
	ImageUrl = "image_url",
	Text = "text",
}

export type VerboseStandardDocumentSourceValues = Nullable<{
	document_type: GeneralFileType | DocumentType;
	document_subtype?: DocumentSubtype;
	metadata: Record<string, unknown>;
	document_source?: DocumentSource;
	folder_path_ids?: Array<string>;
	folder_path: Array<string>;
	file_name: string;
	link?: string;
	id: SourceID;
	content_list: Array<
		| Nullable<{
				type: StandardDocumentContentType.Text;
				text: string;
		  }>
		| Nullable<{
				type: StandardDocumentContentType.ImageUrl;
				image_url: {
					aws_bucket: AwsBucket;
					aws_key: AwsKey;
				};
		  }>
	>;
}>;

export enum StandardDocumentSourceType {
	Verbose = "verbose",
	Minimal = "minimal",
}

export type AirtableSourceForUser = {
	source_type: SourceForUserType.Airtable;
	data_key: string;
	source_info: {
		records: Array<AirtableRecord>;
		type: never;
	};
};

export type AirtableRecord = {
	fields: Record<string, unknown>;
	airtable_connection_id: number;
	table_name: string;
	relevance?: number;
	record_id: string;
	table_id: string;
	base_id: string;
	link?: string;
	id?: SourceID;
	url: string;
};

export enum AffinitySourceType {
	AffinityIntroductionsMadeBy = "AFFINITY_INTRODUCTIONS_MADE_BY",
	AffinityIntroductionsMadeTo = "AFFINITY_INTRODUCTIONS_MADE_TO",
	AffinityOrganization = "AFFINITY_ORGANIZATION",
	AffinityPerson = "AFFINITY_PERSON",
	AffinityNote = "AFFINITY_NOTE",
}

export type AffinitySourceForUser = {
	source_type: SourceForUserType.Affinity;
	data_key: string;
	source_info:
		| {
				type: AffinitySourceType.AffinityOrganization;
				organizations: Array<AffinityOrganization>;
		  }
		| {
				type: AffinitySourceType.AffinityPerson;
				persons: Array<AffinityPerson>;
		  }
		| {
				type: AffinitySourceType.AffinityNote;
				notes: Array<AffinityNote>;
		  }
		| {
				type: AffinitySourceType.AffinityIntroductionsMadeBy;
				introductions: Array<AffinityIntroductionsMadeBy>;
		  }
		| {
				type: AffinitySourceType.AffinityIntroductionsMadeTo;
				introductions: Array<AffinityIntroductionsMadeTo>;
		  };
};

export type AffinitySourceInfoValues =
	| AffinityIntroductionsMadeTo
	| AffinityIntroductionsMadeBy
	| AffinityOrganization
	| AffinityPerson
	| AffinityNote;

export type AffinityOrganization = {
	additional_fields?: Record<string, unknown>;
	long_text_field_data?: Array<string>;
	affinity_organization_id?: number;
	last_email_sent_at?: ISODateString;
	organization_name?: string;
	owners?: Array<string>;
	relevance?: number;
	website?: string;
	status?: string;
	id?: SourceID;
	link?: string;
};

export type AffinityPerson = {
	additional_fields?: Record<string, unknown>;
	long_text_field_data?: Array<string>;
	phone_numbers?: Array<string>;
	organizations?: Array<string>;
	industries?: Array<string>;
	job_titles?: Array<string>;
	emails?: Array<string>;
	primary_email?: string;
	linkedin_url?: string;
	affinity_id?: number;
	relevance?: number;
	location?: string;
	id?: SourceID;
	link?: string;
	name?: string;
};

export type AffinityNote = {
	tagged_persons?: Array<string>;
	tagged_organizations?: string;
	tagged_opportunities?: string;
	organization_name?: string;
	attendees?: Array<string>;
	created_at?: ISODateString;
	affinity_id?: number;
	relevance?: number;
	author?: string;
	id?: SourceID;
	link?: string;
	note?: string;
};

export type AffinityIntroductionsMadeBy = {
	internal_person_being_introed_email?: string;
	external_person_being_introed_email?: string;
	internal_person_being_introed_name?: string;
	external_person_being_introed_name?: string;
	person_making_intro_organization?: string;
	person_making_intro_domain?: string;
	person_making_intro_email?: string;
	date_of_introduction?: ISODateString;
	person_making_intro_name?: string;
	relevance?: number;
	id?: SourceID;
	link?: string;
};

export type AffinityIntroductionsMadeTo = {
	person_receiving_intro_organization?: string;
	person_receiving_intro_domain?: string;
	person_being_introduced_email?: string;
	person_receiving_intro_email?: string;
	person_being_introduced_name?: string;
	person_receiving_intro_name?: string;
	internal_introducer_email?: string;
	internal_introducer_name?: string;
	date_of_introduction?: string;
	relevance?: number;
	id?: SourceID;
	link?: string;
};

export type ModeDefinitionSourceForUser = {
	source_type: SourceForUserType.ModeDefinition;
	data_key: string;
	source_info: {
		mode_definitions: Array<ModeDefinitionType>;
		type: never;
	};
};

export type ModeDefinitionType = {
	connection_type: DatabaseConnectionType;
	mode_definition_id: string;
	connection_id: number;
	description: string;
	relevance?: number;
	id?: SourceID;
	link?: string;
	query: string;
	name: string;
};

export type ModeQuerySourceForUser = {
	source_type: SourceForUserType.ModeQuery;
	data_key: string;
	source_info: {
		mode_queries: Array<ModeQueryType>;
		type: never;
	};
};

export type ModeQueryType = {
	connection_type: DatabaseConnectionType;
	connection_id: number;
	mode_query_id: string;
	relevance?: number;
	id?: SourceID;
	link?: string;
	query: string;
	name: string;
};

export enum GoogleDriveSourceType {
	Minimal = "minimal",
	Verbose = "verbose",
}

export enum GoogleDriveFileType {
	DOCX = "DOCX",
	PDF = "PDF",
	CSV = "CSV",
}

export enum GoogleDriveContentType {
	ImageUrl = "image_url",
	Text = "text",
}

export type GoogleDriveVerboseSource = {
	document_type: GoogleDriveFileType;
	metadata: Record<string, unknown>;
	calculated_score?: number;
	file_name?: string;
	file_id: SourceID;
	link?: string;
	id?: SourceID;
	content_list: Array<{
		type: GoogleDriveContentType;
		text: string;
		image_url: {
			aws_bucket: AwsBucket;
			aws_key: AwsKey;
		};
	}>;
};

export type GoogleDriveMinimalSource = {
	relevance: number;
	link?: string;
	id?: SourceID;
	fields: {
		document_type: GoogleDriveFileType;
		long_text_data?: Array<string>;
		is_image_useful: string;
		image_aws_key: string;
		is_table_root: string;
		document_uuid: string;
		chunk_id: string;
		filename: string;
		group_id: string;
		file_id: string;
	};
};

export type GoogleDriveSourcesForUser = {
	source_type: SourceForUserType.GoogleDrive;
	data_key: string;
	source_info:
		| {
				documents: GoogleDriveVerboseSource;
				type: GoogleDriveSourceType.Verbose;
		  }
		| {
				documents: Array<GoogleDriveMinimalSource>;
				type: GoogleDriveSourceType.Minimal;
		  };
};

export type SQLQuerySourceForUser = {
	source_type: SourceForUserType.SqlQuery;
	data_key: string;
	source_info: {
		queries: Array<SQLQueryType>;
		type: never;
	};
};

export type SQLQueryType = {
	connection_type: DatabaseConnectionType;
	verified_by_user_id: number;
	source: QuerySourceType;
	verified_by_user: User;
	connection_id: number;
	description: string;
	relevance?: number;
	verified: boolean;
	query_id: number;
	link?: string;
	query: string;
	id?: SourceID;
};

enum QuerySourceType {
	Metabase = "METABASE",
	Self = "SELF",
	Mode = "MODE",
}

export type DataSchemaSourceForUser = {
	source_type: SourceForUserType.DataSchema;
	data_key: string;
	source_info: {
		entities: Array<DataSchemaEntity>;
		type: never;
	};
};

enum EntityType {
	DATA_SCHEMA = "DATA_SCHEMA",
	DATABASE = "DATABASE",
	SCHEMATA = "SCHEMATA",
	TABLE = "TABLE",
	FIELD = "FIELD",
}

export type DataSchemaEntity = {
	connection_type: DatabaseConnectionType;
	entity_type: EntityType;
	schemata_name: string;
	database_name: string;
	connection_id: number;
	schemata_id: number;
	database_id: number;
	field_name: string;
	table_name: string;
	relevance?: number;
	field_id: number;
	table_id: number;
	link?: string;
	name: string;
	id: SourceID;
};

export type SlackSourceForUser = {
	source_type: SourceForUserType.Slack;
	data_key: string;
	source_info: {
		conversations: Array<SlackConversation>;
		type: never;
	};
};

export type SlackConversation = {
	channel_name?: string;
	channel_id: string;
	relevance?: number;
	id?: SourceID;
	link?: string;
	url: string;
	messages: Array<{
		sent_at: ISODateString;
		message_id: string;
		sender: string;
		text: string;
		replies: Array<{
			sent_at: ISODateString;
			message_id: string;
			sender: string;
			text: string;
		}>;
	}>;
};

export type WebSourceForUser = {
	source_type: SourceForUserType.Web;
	data_key: string;
	source_info: {
		website_snippets: Array<WebsiteSnippet>;
		type: never;
	};
};

export type WebsiteSnippet = {
	document_type: WebsiteDocumentType;
	description: string;
	website_id: number;
	relevance?: number;
	author: string;
	link?: string;
	title: string;
	id: SourceID;
	text: string;
	url: string;
};

enum WebsiteDocumentType {
	WebsiteContent = "WEBSITE_CONTENT",
	Description = "DESCRIPTION",
	Author = "AUTHOR",
	Title = "TITLE",
}

export type PDFSourceForUser = {
	source_type: SourceForUserType.Pdf;
	data_key: string;
	source_info: {
		pdf_snippets: Array<PdfSnippet>;
		type: never;
	};
};

export type PdfSnippet = {
	coordinates: Record<string, unknown>;
	relevance?: number;
	id?: SourceID;
	link?: string;
	pdf_id: PdfId;
	text: string;
};

// ---------------------------------------

export type PlannerInputs = {
	action_type: PlannerActionType;
	tasks: PlannerTask[];
};

export type PlannerTask = {
	sub_tasks?: PlannerTask[];
	is_current_task: boolean;
	task_outputs: string[];
	task_inputs: string[];
	task: string;
};

enum PlannerActionType {
	ReplacePlan = "REPLACE_PLAN",
	CreatePlan = "CREATE_PLAN",
}

export type PlanStep = {
	bot_conversation: { id: BotConversationId };
	parent_step: { id: BotPlanStepId | null };
	updated_at: ISODateString;
	created_at: ISODateString;
	is_current_task: boolean;
	sub_tasks?: PlanStep[];
	task: string | null;
	is_active: boolean;
	plan_uuid: string;
	id: BotPlanStepId;
	is_root: boolean;
	step_num: number;
};

export enum PlanApprovalStatus {
	Not_Needed = "NOT_NEEDED",
	Approved = "APPROVED",
	Rejected = "REJECTED",
	Pending = "PENDING",
}

export type BotPlanStepId = Tagged<number, "BotPlanStepId">;
export type BotPlanUuid = Tagged<string, "BotPlanUuid">;
export type BotPlanId = Tagged<number, "BotPlanId">;

export type Plan = {
	bot_conversation: { id: BotConversationId };
	approval_status: PlanApprovalStatus;
	sub_tasks?: PlanStep[] | undefined;
	plan_uuid: BotPlanUuid;
	is_active: boolean;
	id: BotPlanId;
};
