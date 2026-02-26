import type { Tagged } from "type-fest";

import { createISODate } from "#/lib/utils";
import type { AwsBucket, AwsKey, ISODateString } from "#/types/general";
import type {
	NormalDatabaseConnection,
	NormalDatabaseConnectionDataSchemaId,
	NormalDatabaseConnectionId,
} from "#/types/databases";
import type { IndexingFileStatus, IndexingFileStep } from "#/types/file";
import type { Organization, OrganizationId } from "#/types/organization";
import type { User } from "#/types/user";
import type { SerializedFilter } from "#/components/table-for-block/filters/utilityTypes";

export type NotebookPermissionId = Tagged<number, "NotebookPermissionId">;
export type BotConversationId = Tagged<number, "BotConversationId">;
export type NotebookBlockUuid = Tagged<string, "NotebookBlockUuid">;
export type NotebookUuid = Tagged<string, "NotebookUuid">;
export type NotebookId = Tagged<number, "NotebookId">;
export type VariableId = Tagged<number, "VariableId">;

export type BotConversation = {
	corresponding_project?: { id: NotebookId };
	is_streaming: boolean;
	id: BotConversationId;
	title: string;
};

export enum ChatTools {
	ANSWER_QUESTION_USING_INTERNAL_AND_EXTERNAL_SEARCH = "ANSWER_QUESTION_USING_INTERNAL_AND_EXTERNAL_SEARCH",
	ANSWER_QUESTION_BY_SEARCHING_ORGANIZATION_CONTEXT = "ANSWER_QUESTION_BY_SEARCHING_ORGANIZATION_CONTEXT",
	ANSWER_QUESTION_USING_WEB_SEARCH = "ANSWER_QUESTION_USING_WEB_SEARCH",
	ANSWER_QUESTION_USING_CONTEXT = "ANSWER_QUESTION_USING_CONTEXT",
	RETURN_NORMAL_TEXT_RESPONSE = "RETURN_NORMAL_TEXT_RESPONSE",
	PERFORM_ACTION_IN_NOTEBOOK = "PERFORM_ACTION_IN_NOTEBOOK",
	ASK_CLARIFYING_QUESTION = "ASK_CLARIFYING_QUESTION",
	WAIT_FOR_HUMAN_MESSAGE = "WAIT_FOR_HUMAN_MESSAGE",
	PLANNER = "PLANNER",
}

export const CHAT_TOOLS = Object.values(ChatTools);

export enum PermissionLevel {
	Admin = "Admin",
	Write = "Write",
	Read = "Read",
}

export enum PermissionType {
	Organization = "Organization",
	User = "User",
}

export type NotebookPermission = {
	permission_level: PermissionLevel;
	organization: Organization | null;
	permission_type: PermissionType;
	id: NotebookPermissionId;
	user: User | null;
};

type TextRecord = { text: string };
export type BlockText = BlockBase & {
	custom_block_info?: {
		paragraph: Array<TextRecord>;
		text_type: TextBlockType;
		plain_text: string;
	};
	type: BlockType.Text;
};

export enum TextBlockType {
	Blockquote = "BLOCKQUOTE",
	Paragraph = "PARAGRAPH",
	H1 = "H1",
	H2 = "H2",
	H3 = "H3",
	H4 = "H4",
	H5 = "H5",
	H6 = "H6",
	Hr = "HR",
}

export type NotebookMetadata = {
	bot_conversation: { id: BotConversationId } | null;
	permissions: Array<NotebookPermission> | null;
	variable_info: Record<string, Variable>;
	organization: { id: OrganizationId };
	uuid: NotebookUuid;
	id: NotebookId;
	title: string;
};

export enum BlockObjectType {
	Block = "block",
}

export enum BlockType {
	Python = "python",
	Image = "image",
	Table = "table",
	Text = "text",
	Sql = "sql",
	Csv = "csv",
	Pdf = "pdf",
}

export type Variable = {
	columns?: { name: string; type: string }[];
	// [key: string | number]: unknown;
	block_id: number | string;
	id?: VariableId;
	error?: string;
	value: string;
	name?: string;
	uuid: string;
	type: string;
};

type PartialVariable = Partial<
	Omit<Variable, "id" | "uuid" | "block_id" | "type" | "value">
>;

export type BlockBase = {
	write_variables?: Array<Variable> | Array<PartialVariable>;
	read_variables?: Array<Variable> | Array<PartialVariable>;
	parent_block_uuid: NotebookBlockUuid | null;
	block_above_uuid: NotebookBlockUuid | null;
	last_run_at: ISODateString | null;
	children?: Array<NotebookBlock>;
	object: BlockObjectType.Block;
	created_at: ISODateString;
	last_run_by: User | null;
	last_modified_at: string;
	uuid: NotebookBlockUuid;
	id: number | undefined;
	last_modified_by: User;
	is_running: boolean;
	label: BlockLabel;
	created_by: User;
};

export type DataPreview = {
	data: Record<string, unknown>[] | null;
	num_rows: number;
	offset: number;
	limit: number;
};

export enum BlockLabel {
	CHAT_SNIPPET = "chat-snippet",
	TABLE_BLOCK = "table-block",
	BLOCKQUOTE = "blockquote",
	PARAGRAPH = "paragraph",
	PYTHON = "python",
	IMAGE = "image",
	SQLE = "sqle",
	PDF = "pdf",
	CSV = "csv",
	H1 = "h1",
	H2 = "h2",
	H3 = "h3",
	H4 = "h4",
	H5 = "h5",
	H6 = "h6",
	HR = "hr",
	TP = "tp",
	UL = "ul",
	OL = "ol",
}

export type BlockFilterAndSort = {
	filters: SerializedFilter | undefined;
	/**
	 * -ORDER_ID for descending, ORDER_ID for ascending
	 */
	sort_by: string[] | undefined;
};

export type BlockTable = BlockBase & {
	label: BlockLabel.TABLE_BLOCK;
	type: BlockType.Table;
	custom_block_info?: {
		data_preview?: DataPreview | { error: string } | null;
		data_preview_updated_at?: ISODateString | null;
		filters?: BlockFilterAndSort | null;
		is_data_preview_stale?: boolean;
		title: string;
	};
};

type IntegrationDataShallow = {
	name?: string;
	type?: string;
	id?: number;
};

type IntegrationDataDeep = {
	organization?: Organization;
	is_enabled: boolean;
	is_public: boolean;
	updated_at: string;
	created_at: string;
	created_by: User;
	type?: string;
	name?: string;
	id?: number;
};

type SqlSourceIntegration = IntegrationDataShallow | IntegrationDataDeep;

export enum SqlBlockSourceType {
	Integration = "INTEGRATION",
	Dataframes = "DATAFRAMES",
}

export const DATAFRAMES = "DataFrames";
export const DataFrameDatabaseConnection: NormalDatabaseConnection = {
	type: SqlBlockSourceType.Dataframes as unknown as NormalDatabaseConnection["type"],
	data_schema_id: Number.EPSILON as NormalDatabaseConnectionDataSchemaId,
	id: Number.EPSILON as NormalDatabaseConnectionId,
	organizations_with_access: [],
	updated_at: createISODate(),
	created_at: createISODate(),
	schema: undefined as never,
	suggested_queries: [],
	is_executable: false,
	allowed_actions: [],
	organization: null,
	collaborators: [],
	is_enabled: true,
	created_by: null,
	name: DATAFRAMES,
	is_public: true,
	schema_url: "",
	enabled: true,
};

export type BlockSql = BlockBase & {
	lastEdited?: string;
	type: BlockType.Sql;
	custom_block_info?: {
		data_preview?: DataPreview | { error: string };
		source_integration: SqlSourceIntegration;
		data_preview_updated_at?: ISODateString;
		source_type: SqlBlockSourceType;
		is_data_preview_stale?: boolean;
		filters?: BlockFilterAndSort;
		command?: string;
		query: string;
		title: string;
	};
};

export enum KernelResultsTypes {
	FIXED_PYTHON = "FIXED_PYTHON",
	REACT_NODE = "REACT_NODE",
	FIXED_SQL = "FIXED_SQL",
	TEXT_HTML = "TEXT_HTML",
	ERROR = "ERROR",
	IMAGE = "IMAGE",
	TEXT = "TEXT",
}

export type KernelResult = {
	reactNode?: React.ReactNode;
	type: KernelResultsTypes;
	value: string;
};

export type BlockPython = BlockBase & {
	type: BlockType.Python;
	custom_block_info?: {
		data_preview?: KernelResult[] | { error: string };
		data_preview_updated_at?: ISODateString;
		is_data_preview_stale?: boolean;
		text_type?: "python";
		command?: string;
		title: string;
		code: string;
	};
	lastEdited?: string;
};

export type BlockCsv = BlockBase & {
	type: BlockType.Csv;
	custom_block_info?: {
		data_preview?: DataPreview | { error: string } | null;
		data_preview_updated_at?: ISODateString | null;
		filters?: BlockFilterAndSort | null;
		is_data_preview_stale?: boolean;
		file_size_bytes: number;
		text_type?: "csv";
		file_name: string;
		file_info: string;
		title: string;
	};
};

export type BlockImage = BlockBase & {
	type: BlockType.Image;
	custom_block_info?: {
		aws_bucket: AwsBucket | null;
		preview_url?: string | null;
		aws_key: AwsKey | null;
		caption: string | null;
		title: string | null;
	};
};

export type PdfUuid = Tagged<string, "PdfUuid">;
export type PdfId = Tagged<number, "PdfId">;

export type BlockPDF = BlockBase & {
	type: BlockType.Pdf;
	custom_block_info?: {
		title: string | null;
		pdf?: {
			file_size_bytes: string | undefined;
			overall_progress_percent?: number;
			index_status?: IndexingFileStatus;
			indexing_step?: IndexingFileStep;
			file_name: string | undefined;
			file_info: string | undefined;
			description?: string | null;
			summary?: string | null;
			presigned_url?: string;
			uuid?: PdfUuid | null;
			type: "pdf";
			id?: PdfId;
		};
	};
};

export type NotebookBlock =
	| BlockPython
	| BlockImage
	| BlockTable
	| BlockText
	| BlockSql
	| BlockCsv
	| BlockPDF;

export type Notebook = {
	blocks: Array<NotebookBlock>;
	metadata: NotebookMetadata;
};

export enum NotebookActionType {
	// BotConversationMessage:
	CreateBotConversationMessage = "CREATE_BOT_CONVERSATION_MESSAGE",
	DeleteBotConversationMessage = "DELETE_BOT_CONVERSATION_MESSAGE",
	UpdateBotConversationMessage = "UPDATE_BOT_CONVERSATION_MESSAGE",
	UpdateBotConversation = "UPDATE_BOT_CONVERSATION",
	CreatePlanStep = "CREATE_PLAN_STEP",
	UpdatePlanStep = "UPDATE_PLAN_STEP",
	UpdatePlan = "UPDATE_PLAN",
	CreatePlan = "CREATE_PLAN",
	// Project:
	UpdateProject = "UPDATE_PROJECT",
	// Block:
	CreateBlock = "CREATE_BLOCK",
	UpdateBlock = "UPDATE_BLOCK",
	DeleteBlock = "DELETE_BLOCK",
}

export type CreateBlockAction = {
	action_type: NotebookActionType.CreateBlock;
	timestamp: ISODateString;
	action_info: {
		parent_block_uuid: NotebookBlockUuid | null;
		block_above_uuid: NotebookBlockUuid | null;
		block_below_uuid: NotebookBlockUuid | null;
		is_description_block?: boolean;
		block: NotebookBlock;
	};
};

export type DeleteBlockAction = {
	action_type: NotebookActionType.DeleteBlock;
	action_info: {
		block_uuid: string;
	};
};

type UpdateNotebookActionInfo<T = unknown> = { project_uuid: NotebookUuid } & {
	key: string;
	value: T;
};

export type UpdateNotebookAction = {
	action_type: NotebookActionType.UpdateProject;
	action_info: UpdateNotebookActionInfo;
};

export enum UpdateBlockActionKey {
	SourceIntegration = "source_integration",
	ReadVariables = "read_variables",
	Description = "description",
	SourceType = "source_type",
	DataFrame = "data_frame",
	PlainText = "plain_text",
	Paragraph = "paragraph",
	TextType = "text_type",
	Label = "label",
	Query = "query",
	Title = "title",
	Chart = "chart",
	Code = "code",
}

type UpdateBlockActionInfo = {
	block_uuid: NotebookBlockUuid;
} & (
	| {
			key:
				| UpdateBlockActionKey.Description
				| UpdateBlockActionKey.PlainText
				| UpdateBlockActionKey.Paragraph
				| UpdateBlockActionKey.Label
				| UpdateBlockActionKey.Query
				| UpdateBlockActionKey.Title
				| UpdateBlockActionKey.Code;
			value: string;
	  }
	| {
			key: UpdateBlockActionKey.ReadVariables;
			value: Array<{
				name: string;
			}>;
	  }
	| {
			key: UpdateBlockActionKey.SourceIntegration;
			value: SqlSourceIntegration | null;
	  }
	| { key: UpdateBlockActionKey.SourceType; value: SqlBlockSourceType }
	| { key: UpdateBlockActionKey.Paragraph; value: Array<unknown> }
	| { key: UpdateBlockActionKey.TextType; value: TextBlockType }
);

export type UpdateBlockAction = {
	action_type: NotebookActionType.UpdateBlock;
	action_info: UpdateBlockActionInfo;
};

export type PatchNotebookAction =
	| UpdateNotebookAction
	| CreateBlockAction
	| UpdateBlockAction
	| DeleteBlockAction;
