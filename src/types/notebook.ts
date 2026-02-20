import type { Tagged } from "type-fest";

import { createISODate } from "#/lib/utils";
import type {
	DatabaseConnectionType,
	NormalDatabaseConnection,
	NormalDatabaseConnectionDataSchemaId,
	NormalDatabaseConnectionId,
} from "#/types/databases";
import type { ISODateString, UUID } from "#/types/general";
import type { Organization, OrganizationId } from "#/types/organization";
import type { User } from "#/types/user";

export type BotConversationId = Tagged<number, "BotConversationId">;
export type NotebookId = Tagged<number, "NotebookId">;
type BotId = Tagged<number, "BotId">;

export type BotConversation = {
	corresponding_project?: { id: NotebookId };
	created_as_conversation: boolean;
	bot: { id: BotId | null };
	created_at: ISODateString;
	updated_at: ISODateString;
	is_streaming: boolean;
	id: BotConversationId;
	archived: boolean;
	created_by: User;
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

type ModifiedBy = {
	modified_at: ISODateString;
	user: User;
};

export enum PermissionLevel {
	Admin = "Admin",
	Write = "Write",
	Read = "Read",
}

export const PERMISSION_LEVELS = Object.values(PermissionLevel);

export enum PermissionType {
	Organization = "Organization",
	User = "User",
}

export type NotebookPermissionId = Tagged<number, "NotebookPermissionId">;

export type NotebookPermission = {
	permission_level: PermissionLevel;
	organization: Organization | null;
	permission_type: PermissionType;
	id: NotebookPermissionId;
	user: User | null;
};

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

export type VariableId = Tagged<number, "VariableId">;

export type NotebookAssignee = {
	is_owner: boolean;
	user: User;
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

export type NotebookUuid = Tagged<string, "NotebookUuid">;

export enum NotebookImportance {
	Critical = "CRITICAL",
	Backlog = "BACKLOG",
	Medium = "MEDIUM",
	High = "HIGH",
	Low = "LOW",
}

export enum NotebookStatus {
	NotStarted = "NOT_STARTED",
	InProgress = "IN_PROGRESS",
	Completed = "COMPLETE",
	Blocked = "BLOCKED",
}

export type NotebookMetadata = {
	bot_conversation: { id: BotConversationId } | null;
	permissions: Array<NotebookPermission> | null;
	variable_info: Record<string, Variable>;
	assigned_to: Array<NotebookAssignee>;
	organization: { id: OrganizationId };
	modified_by: Array<ModifiedBy>;
	last_modified_by: User | null;
	description: BlockText | null;
	priority: NotebookImportance;
	created_at: ISODateString;
	status: NotebookStatus;
	last_modified: string;
	run_frequency: string;
	uuid: NotebookUuid;
	favorited: boolean;
	run_every: number;
	archived: boolean;
	created_by: User;
	request: string;
	id: NotebookId;
	title: string;
	kernel_info?: {
		is_kernel_active: boolean;
		cpu_percent_usage: number;
		memory: {
			usage: string;
			total: string;
		};
	};
};

export enum BlockObjectType {
	Block = "block",
}

type PartialVariable = Partial<
	Omit<Variable, "id" | "uuid" | "block_id" | "type" | "value">
>;

export enum BlockType {
	Text = "text",
	Sql = "sql",
}

type ModeUser = {
	mode_user_id: string;
	username: string;
	email: string;
	name: string;
	id: number;
};

type ModeDataConnection = {
	mode_connection_id: string;
	name: string;
	id: number;
};

enum QueryState {
	DELETED = "DELETED",
	ACTIVE = "ACTIVE",
}

type MetabaseUser = {
	metabase_user_id: number;
	date_joined: ISODateString;
	last_login: ISODateString;
	is_superuser: string;
	common_name: string;
	first_name: string;
	last_name: string;
	is_active: string;
	email: string;
};

type MetabaseCollection = {
	metabase_collection_id: number;
	personal_owner: MetabaseUser;
	description: string;
	color: string;
	name: string;
	slug: string;
};

type MetabaseQuery = Query & {
	entity_type: QueryEntityType.METABASE_CARD;
	source: QuerySource.METABASE;
	metabase_card: {
		metabase_updated_at: ISODateString;
		metabase_created_at: ISODateString;
		collection: MetabaseCollection;
		last_edited_by: MetabaseUser;
		last_edited_at: ISODateString;
		metabase_card_id: number;
		creator: MetabaseUser;
		external_url: string;
		description: string;
		name: string;
	};
};

type ModeDefinitionQuery = Query & {
	entity_type: QueryEntityType.MODE_DEFINITION;
	mode_definition: {
		mode_data_connection: ModeDataConnection;
		mode_created_at_utc: ISODateString;
		mode_deleted_at_utc: ISODateString;
		mode_definition_id: string;
		description: string;
		state: QueryState;
		creator: ModeUser;
		name: string;
		url: string;
	};
};

type ModeQuery = Query & {
	entity_type: QueryEntityType.MODE_QUERY;
	mode_query: {
		mode_data_connection: ModeDataConnection;
		mode_created_at_utc: ISODateString;
		mode_query_id: string;
		url: string | null;
		state: QueryState;
		creator: ModeUser;
		run_count: number;
		name: string;
	};
};

export type SimilarQuery = {
	query: VerifiedQuery | ModeQuery | ModeDefinitionQuery | MetabaseQuery;
	relevance: number;
};

export enum FilterArchived {
	ONLY_NON_ARCHIVED = "False",
	ONLY_ARCHIVED = "True",
	ALL = "All",
}

export type NotebookBlockUuid = Tagged<string, "NotebookBlockUuid">;

export type BlockBase = {
	write_variables?: Array<Variable> | Array<PartialVariable>;
	read_variables?: Array<Variable> | Array<PartialVariable>;
	parent_block_uuid: NotebookBlockUuid | null;
	block_above_uuid: NotebookBlockUuid | null;
	similar_queries: Array<SimilarQuery>;
	last_run_at: ISODateString | null;
	children?: Array<NotebookBlock>;
	object: BlockObjectType.Block;
	created_at: ISODateString;
	last_run_by: User | null;
	last_modified_at: string;
	uuid: NotebookBlockUuid;
	last_modified_by: User;
	id: number | undefined;
	is_running: boolean;
	label: BlockLabel;
	created_by: User;

	/** only used on FE during update generation */
	order_by_timestamp_ms?: number | null;
};

export type DataPreview = {
	data: Record<string, unknown>[] | null;
	num_rows: number;
	offset: number;
	limit: number;
};

export enum BlockLabel {
	SQLE = "sqle",
}

export type BlockFilterAndSort = {
	filters: SerializedFilter | undefined;
	/**
	 * -ORDER_ID for descending, ORDER_ID for ascending
	 */
	sort_by: string[] | undefined;
};

type IntegrationDataShallow = {
	name?: string;
	type?: string;
	id?: number;
};

type IntegrationDataDeep = {
	organization?: Organization;
	created_by: User;
	is_enabled: boolean;
	is_public: boolean;
	updated_at: string;
	created_at: string;
	type?: string;
	name?: string;
	id?: number;
};

export type QueryUuid = Tagged<string, "QueryUuid">;

enum CollectionIDTypes {
	python_code = "python_code",
	sql_query = "sql_query",
}

type QueryNote = {
	created_at: ISODateString;
	updated_at: ISODateString;
	collaborators: User[];
	created_by: User;
	text: string;
	query: Query;
	id: number;
};

enum QuerySource {
	METABASE = "METABASE",
	SELF = "SELF",
}

enum AnswerType {
	SqlQuery = "SQL_QUERY",
}

type Query = {
	connection_type: DatabaseConnectionType;
	verified_by: User | null;
	collection_id: CollectionIDTypes;
	entity_type: QueryEntityType;
	should_be_indexed: boolean;
	/* If this is null, means the project no longer exists! */
	project_uuid: UUID | null;
	stored_in_milvus: boolean;
	/* If this is null, means the block no longer exists! */
	block_uuid: UUID | null;
	answer_type: AnswerType;
	user: User;
	query_uuid: QueryUuid;
	connection_id: number;
	generator: Generator;
	source: QuerySource;
	favorited: boolean;
	updated_at: string;
	created_at: string;
	notes: QueryNote[];
	project_id: string;
	verified: boolean;
	tags?: string[];
	prompt: string;
	answer: string;
	title?: string;
	id: number;
};

enum QueryEntityType {
	MODE_DEFINITION = "MODE_DEFINITION",
	ROOT_DATA_SCHEMA = "DATA_SCHEMA",
	METABASE_CARD = "METABASE_CARD",
	MODE_QUERY = "MODE_QUERY",
	SQL_QUERY = "SQL_QUERY",
}

export type VerifiedQuery = Query & {
	entity_type: QueryEntityType.SQL_QUERY;
	verified: true;
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
		verified_queries?: VerifiedQuery[];
		source_type: SqlBlockSourceType;
		is_data_preview_stale?: boolean;
		filters?: BlockFilterAndSort;
		command?: string;
		query: string;
		title: string;
	};
};

export type PdfUuid = Tagged<string, "PdfUuid">;
export type PdfId = Tagged<number, "PdfId">;

export type NotebookBlock = BlockSql;

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
		order_by_timestamp_ms: number | null;
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
