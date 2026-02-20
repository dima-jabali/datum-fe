import type { Tagged } from "type-fest";

import type { ISODateString, Nullable } from "#/types/general";
import type { Organization } from "#/types/organization";
import type { User } from "#/types/user";
import type {
	GeneralFileIndexStatus,
	GoogleDriveDatabaseConnectionId,
} from "#/types/file";

export enum DatabaseConnectionType {
	ExternalDatasource = "ExternalDatasourceConnection",
	OracleDatabase = "OracleDatabaseConnection",
	GoogleDrive = "GoogleDriveConnection",
	Snowflake = "SnowflakeConnection",
	Airtable = "AirtableConnection",
	Postgres = "PostgresConnection",
	BigQuery = "BigQueryConnection",
	ClickUp = "ClickUpConnection",
	YouTube = "YoutubeConnection",
	Polygon = "PolygonConnection",
	Spotify = "SpotifyConnection",
	Notion = "NotionConnection",
	Slack = "SlackConnection",
}

export type ClickUpWorkspaceStringId = Tagged<
	string,
	"ClickUpWorkspaceStringId"
>;
export type ClickUpChatViewStringId = Tagged<string, "ClickUpChatViewStringId">;
export type ClickUpFolderStringId = Tagged<string, "ClickUpFolderStringId">;
export type ClickUpSpaceStringId = Tagged<string, "ClickUpSpaceStringId">;
export type ClickUpListStringId = Tagged<string, "ClickUpListStringId">;
export type ClickUpConnectionId = Tagged<number, "ClickUpConnectionId">;
export type ClickUpWorkspaceId = Tagged<number, "ClickUpWorkspaceId">;
export type ClickUpChatViewId = Tagged<number, "ClickUpChatViewId">;
export type ClickUpFolderId = Tagged<number, "ClickUpFolderId">;
export type ClickUpSpaceId = Tagged<number, "ClickUpSpaceId">;
export type ClickUpListId = Tagged<number, "ClickUpListId">;

export enum ClickUpEntityType {
	Workspace = "WORKSPACE",
	ChatView = "CHAT_VIEW",
	Folder = "FOLDER",
	Space = "SPACE",
	List = "LIST",
}

export type ClickUpChatView = {
	parent_entity_type: ClickUpEntityType;
	view_id: ClickUpChatViewStringId;
	include_in_indexing: boolean;
	date_created: ISODateString;
	last_indexed: ISODateString;
	index_by_default: boolean;
	id: ClickUpChatViewId;
	visibility: string;
	protected: boolean;
	name: string;
};

export type ClickUpTask = unknown;

export type ClickUpList = {
	chat_views?: Array<ClickUpChatView>;
	index_documents_by_default: boolean;
	folder: { id: ClickUpFolderId };
	space: { id: ClickUpSpaceId };
	list_id: ClickUpListStringId;
	include_in_indexing: boolean;
	tasks?: Array<ClickUpTask>;
	index_by_default: boolean;
	index_documents: boolean;
	is_folderless: boolean;
	orderindex: number;
	id: ClickUpListId;
	archived: boolean;
	content: string;
	name: string;
};

export type ClickUpFolder = {
	chat_views?: Array<ClickUpChatView>;
	index_documents_by_default: boolean;
	folder_id: ClickUpFolderStringId;
	space: { id: ClickUpSpaceId };
	include_in_indexing: boolean;
	lists?: Array<ClickUpList>;
	index_by_default: boolean;
	index_documents: boolean;
	id: ClickUpFolderId;
	orderindex: number;
	archived: boolean;
	hidden: boolean;
	name: string;
};

export type ClickUpSpace = {
	workspace: { id: ClickUpWorkspaceId };
	chat_views?: Array<ClickUpChatView>;
	index_documents_by_default: boolean;
	space_id: ClickUpSpaceStringId;
	folders?: Array<ClickUpFolder>;
	include_in_indexing: boolean;
	lists?: Array<ClickUpList>;
	admin_can_manage: boolean;
	index_by_default: boolean;
	index_documents: boolean;
	avatar: string | null;
	id: ClickUpSpaceId;
	private: boolean;
	color: string;
	name: string;
};

export type ClickUpWorkspace = {
	workspace_id: ClickUpWorkspaceStringId;
	chat_views?: Array<ClickUpChatView>;
	index_documents_by_default: boolean;
	include_in_indexing: boolean;
	spaces: Array<ClickUpSpace>;
	index_by_default: boolean;
	index_documents: boolean;
	id: ClickUpWorkspaceId;
	avatar: string;
	color: string;
	name: string;
};

export type ClickUpConnectionType = BaseDatabaseConnection & {
	type: DatabaseConnectionType.ClickUp;
	index_everything_documents: boolean;
	workspaces: Array<ClickUpWorkspace>;
	suggested_queries: Array<string>;
	collaborators: Array<string>;
	id: ClickUpConnectionId;
};

export type BaseDatabaseConnection = Nullable<{
	data_schema_id: NormalDatabaseConnectionDataSchemaId;
	allowed_actions: Array<string>;
	organization: Organization;
	created_at: ISODateString;
	updated_at: ISODateString;
	is_executable: boolean;
	is_enabled: boolean;
	is_public: boolean;
	created_by: User;
	name: string;
}> & {
	organizations_with_access: Array<Organization>;
};

export type DatabaseConnection =
	| SlackConnectionDataWithDefinedChannels
	| GoogleDriveDatabaseConnection
	| AirtableDatabaseConnection
	| NormalDatabaseConnection
	| ClickUpConnectionType;

export type GoogleDriveDatabaseConnection = BaseDatabaseConnection & {
	data_schema_id: NormalDatabaseConnectionDataSchemaId | null;
	index_status: GeneralFileIndexStatus | null;
	type: DatabaseConnectionType.GoogleDrive;
	id: GoogleDriveDatabaseConnectionId;
	last_index_start: ISODateString;
	last_index_error: string | null;
	allowed_actions: Array<string>;
	is_executable: boolean | null;
	last_indexed: ISODateString;
};

export type AirtableDatabaseConnectionId = Tagged<
	number,
	"AirtableDatabaseConnectionId"
>;

export type AirtableDatabaseConnection = BaseDatabaseConnection & {
	type: DatabaseConnectionType.Airtable;
	id: AirtableDatabaseConnectionId;
	suggested_queries: string[];
	collaborators: string[];
	bases: AirtableBase[];
};

type AirtableBase = AirtableCommonFields & {
	tables: AirtableTable[];
};

export type AirtableTable = AirtableCommonFields & {
	fields: AirtableField[];
};

export type AirtableCommonFieldsId = Tagged<number, "AirtableCommonFieldsId">;

export type AirtableCommonFields = {
	include_in_indexing: boolean;
	id: AirtableCommonFieldsId;
	snowflake_name: string;
	airtable_name: string;
	airtable_id: string;
};

type AirtableField = AirtableCommonFields & {
	airtable_field_type: string;
	select_options: string[];
};

export type GeneralEntityId =
	| NormalDatabaseConnectionDataSchemaId
	| NormalDatabaseConnectionId
	| DatabaseConnection["id"]
	| SchemataId
	| DatabaseId
	| SchemaId
	| TableId
	| FieldId;

export type NormalDatabaseConnectionDataSchemaId = Tagged<
	number,
	"NormalDatabaseConnectionDataSchemaId"
>;
export type NormalDatabaseConnectionId = Tagged<
	number,
	"NormalDatabaseConnectionId"
>;

export type NormalDatabaseConnection = BaseDatabaseConnection & {
	type: Exclude<
		DatabaseConnectionType,
		DatabaseConnectionType.Slack | DatabaseConnectionType.GoogleDrive
	>;
	data_schema_id: NormalDatabaseConnectionDataSchemaId;
	allowed_actions: DatabaseAction[];
	id: NormalDatabaseConnectionId;
	suggested_queries: string[];
	collaborators: string[];
	is_executable: boolean;
	schema_url: string;
	enabled: boolean;
	schema: never; // DatabaseSchema | string; /** Do not use this as it makes redux super slow, use `useColumnContext()` */
};

export enum DatabaseAction {
	EXECUTE_SQL = "Execute SQL",
	GET_SCHEMA = "Get Schema",
	WRITE_SQL = "Write SQL",
}

export type DataConnectionExtended = NormalDatabaseConnection & {
	entity_type: string | EntityType;
	priority_type?: string;
	description?: string;
	schema_id?: SchemaId;
};

export type IntegrationDataId = Tagged<number, "IntegrationDataId">;

export type IntegrationDataShallow = {
	id?: IntegrationDataId;
	name?: string;
	type?: string;
};

export type IntegrationDataDeep = {
	organization?: Organization;
	id?: IntegrationDataId;
	is_enabled: boolean;
	created_at: string;
	is_public: boolean;
	updated_at: string;
	created_by: User;
	type?: string;
	name?: string;
};

export type DatabaseSchema = {
	schema_info: StandardSchema;
	schema_type: SchemaType;
	id: SchemaId;
};

export enum SchemaType {
	STANDARD = "STANDARD",
}

export enum EntityType {
	DATA_SCHEMA = "DATA_SCHEMA",
	DATABASE = "DATABASE",
	SCHEMATA = "SCHEMATA",
	TABLE = "TABLE",
	FIELD = "FIELD",
}

export enum PriorityType {
	PRIORITIZE = "PRIORITIZE",
	EXCLUDE = "EXCLUDE",
	INCLUDE = "INCLUDE",
}

type AbstractSchemaEntity = {
	top_level_schema_id: SchemaId;
	priority_type: PriorityType;
	description: string | null;
	schema_id: SchemaId | null;
	entity_type: EntityType;
	extra_info: ExtraInfo;
	id: GeneralEntityId;
	name: string | null;
};

export type SchemataId = Tagged<number, "SchemataId">;
export type DatabaseId = Tagged<number, "DatabaseId">;
export type SchemaId = Tagged<number, "SchemaId">;
export type TableId = Tagged<number, "TableId">;
export type FieldId = Tagged<number, "FieldId">;

export type Field = AbstractSchemaEntity & {
	database_id: DatabaseId | null;
	schemata_id: SchemataId | null;
	entity_type: EntityType.FIELD;
	database_name: string | null;
	schemata_name: string | null;
	table_name: string | null;
	table_id: TableId;
	id: FieldId;
};

export type Table = AbstractSchemaEntity & {
	database_id: DatabaseId | number;
	entity_type: EntityType.TABLE;
	database_name: string | null;
	schemata_name: string | null;
	table_name: string | null;
	schemata_id: SchemataId;
	fields: Field[];
	id: TableId;
};

export type Database = AbstractSchemaEntity & {
	entity_type: EntityType.DATABASE;
	schematas?: Schemata[];
	tables?: Table[];
	fields?: Field[];
	id: DatabaseId;
};

export type Schemata = AbstractSchemaEntity & {
	entity_type: EntityType.SCHEMATA;
	database_name: string | null;
	database_id: DatabaseId;
	fields?: Field[];
	tables: Table[];
	id: SchemataId;
};

export enum StandardSchemaKeys {
	PARENT_ENTITY = "parent_entity",
	DATABASES = "databases",
	SCHEMATA = "schematas",
	TABLES = "tables",
	FIELDS = "fields",
}

export const STANDARD_SCHEMA_KEYS_VALUES = Object.values(StandardSchemaKeys);

export const STANDARD_SCHEMA_KEYS_TO_ENTITY_TYPE: Record<
	StandardSchemaKeys,
	EntityType
> = {
	[StandardSchemaKeys.PARENT_ENTITY]: EntityType.DATA_SCHEMA,
	[StandardSchemaKeys.DATABASES]: EntityType.DATABASE,
	[StandardSchemaKeys.SCHEMATA]: EntityType.SCHEMATA,
	[StandardSchemaKeys.TABLES]: EntityType.TABLE,
	[StandardSchemaKeys.FIELDS]: EntityType.FIELD,
};

export type StandardSchema = {
	[StandardSchemaKeys.PARENT_ENTITY]: Entity | SchemaEntity;
	[StandardSchemaKeys.DATABASES]: Database[];
	[StandardSchemaKeys.SCHEMATA]: Schemata[];
	[StandardSchemaKeys.TABLES]: Table[];
	[StandardSchemaKeys.FIELDS]: Field[];
};

export enum SchemaEntityType {
	Snowflake = "SnowflakeConnection",
	Postgres = "PostgresConnection",
}

export type SchemaEntity = {
	schema: SchemaEntity_Postgres | SchemaEntity_Snowflake;
	schema_type: SchemaType;
};

export type SchemaEntity_Postgres = {
	databases: SchemaDatabasePostgres[];
};

export type SchemaDatabasePostgres = {
	schemas: SchemaSchemataPostgres[];
	catalog_name: string;
	comment: string;
};

export type SchemaSchemataPostgres = {
	tables: SchemaTablePostgres[];
	schema_owner: string;
	catalog_name: string;
	schema_name: string;
};

export type SchemaTablePostgres = {
	columns: SchemaColumnPostgres[];
	is_insertable_into: boolean;
	table_catalog: string;
	table_schema: string;
	table_name: string;
	table_type: string;
	is_typed: boolean;
};

export type SchemaColumnPostgres = {
	character_maximum_length: number;
	numeric_precision_radix: number;
	character_octet_length: number;
	character_set_catalog: string;
	generation_expression: string;
	is_self_referencing: boolean;
	character_set_schema: string;
	character_set_name: string;
	interval_precision: number;
	datetime_precision: number;
	numeric_precision: number;
	ordinal_position: number;
	column_default: string;
	dtd_identifier: string;
	identity_cycle: string;
	is_generated: boolean;
	numeric_scale: number;
	is_updatable: boolean;
	table_catalog: string;
	interval_type: string;
	is_identity: boolean;
	table_schema: string;
	is_nullable: boolean;
	column_name: string;
	udt_catalog: string;
	udt_schema: string;
	table_name: string;
	data_type: string;
	udt_name: string;
};

export type SchemaEntity_Snowflake = {
	databases: SchemaDatabaseSnowflake[];
};

export type SchemaDatabaseSnowflake = {
	schemas: SchemaSchemataSnowflake[];
	catalog_name: string;
	comment: string;
};

export type SchemaSchemataSnowflake = {
	tables: SchemaTableSnowflake[];
	last_altered_at: ISODateString;
	is_managed_access: boolean;
	created_at: ISODateString;
	retention_time: number;
	is_transient: boolean;
	catalog_name: string;
	schema_owner: string;
	schema_name: string;
	comment: string;
};

export type SchemaTableSnowflake = {
	columns: SchemaColumnSnowflake[];
	last_altered_at: ISODateString;
	is_insertable_into: boolean;
	last_ddl_at: ISODateString;
	created_at: ISODateString;
	is_transient: boolean;
	table_catalog: string;
	table_schema: string;
	table_owner: string;
	last_ddl_by: string;
	table_name: string;
	table_type: string;
	is_typed: boolean;
	row_count: string;
	comment: string;
	bytes: string;
};

export type SchemaColumnSnowflake = {
	character_maximum_length: number;
	numeric_precision_radix: number;
	character_octet_length: number;
	character_set_catalog: string;
	is_self_referencing: boolean;
	character_set_schema: string;
	datetime_precision: number;
	interval_precision: number;
	character_set_name: string;
	numeric_precision: number;
	ordinal_position: number;
	dtd_identifier: string;
	identity_cycle: string;
	column_default: string;
	numeric_scale: number;
	table_catalog: string;
	interval_type: string;
	is_identity: boolean;
	table_schema: string;
	is_nullable: boolean;
	udt_catalog: string;
	column_name: string;
	table_name: string;
	udt_schema: string;
	data_type: string;
	udt_name: string;
	comment: string;
};

export type StandardSchemaIteration = [StandardSchemaKeys, Entity[]];

export type Entity = Database | Schemata | Table | Field;

type ExtraInfo =
	| {
			default_character_set_catalog: null;
			default_character_set_schema: null;
			default_character_set_name: null;
			catalog_name: string;
			schema_owner: string;
			schema_name: string;
			sql_path: null;
	  }
	| {
			self_referencing_column_name: null;
			user_defined_type_catalog: null;
			user_defined_type_schema: null;
			user_defined_type_name: null;
			reference_generation: null;
			is_insertable_into: string;
			table_catalog: string;
			table_schema: string;
			commit_action: null;
			table_type: string;
			table_name: string;
			is_typed: string;
	  }
	| {
			udt_name: string;
			data_type: string;
			scope_name: null;
			table_name: string;
			udt_schema: string;
			column_name: string;
			domain_name: null;
			is_identity: string;
			is_nullable: string;
			udt_catalog: string;
			is_generated: string;
			is_updatable: string;
			scope_schema: null;
			table_schema: string;
			domain_schema: null;
			interval_type: null;
			numeric_scale: number;
			scope_catalog: null;
			table_catalog: string;
			collation_name: null;
			column_default: null;
			domain_catalog: null;
			dtd_identifier: string;
			identity_cycle: string;
			identity_start: null;
			collation_schema: null;
			identity_maximum: null;
			identity_minimum: null;
			ordinal_position: number;
			collation_catalog: null;
			numeric_precision: number;
			character_set_name: null;
			datetime_precision: null;
			identity_increment: null;
			interval_precision: null;
			identity_generation: null;
			is_self_referencing: string;
			maximum_cardinality: null;
			character_set_schema: null;
			character_set_catalog: null;
			generation_expression: null;
			character_octet_length: null;
			numeric_precision_radix: number;
			character_maximum_length: null;
	  }
	| Record<string, unknown>
	| null;

export type SlackConnectionId = Tagged<number, "SlackConnectionId">;

export type RawSlackConnectionData = BaseDatabaseConnection & {
	type: DatabaseConnectionType.Slack;
	slack_workspace_name: string;
	suggested_queries: string[];
	last_indexed: ISODateString;
	slack_workspace_id: number;
	allowed_actions: string[];
	channels: SlackChannel[];
	collaborators: string[];
	id: SlackConnectionId;
	created_by: null;
	team_id: string;
};

export type SlackChannelWithName = SlackChannel & { name: string };

export type SlackConnectionDataWithDefinedChannels = RawSlackConnectionData & {
	channels: SlackChannelWithName[];
	name: string;
};

export type SlackChannelId = Tagged<number, "SlackChannelId">;

export type SlackChannel = {
	is_pending_ext_shared: null | boolean;
	pending_shared: null | boolean;
	is_org_shared: null | boolean;
	is_ext_shared: null | boolean;
	should_index: null | boolean;
	is_archived: null | boolean;
	num_members: null | number;
	is_channel: null | boolean;
	is_general: null | boolean;
	is_private: null | boolean;
	is_shared: null | boolean;
	is_member: null | boolean;
	slack_channel_id: string;
	is_group: null | boolean;
	is_mpim: null | boolean;
	is_im: null | boolean;
	name: null | string;
	id: SlackChannelId;
};

export type SearchSchemaResponse = {
	results: {
		connection: {
			type: DatabaseConnectionType | null;
			id: DatabaseConnection["id"];
			name: string | null;
		};
		relevance: number;
		result: Entity;
	}[];
	num_results: number;
};
