import type { Tagged } from "type-fest";

import type { User } from "#/types/user";
import type {
	AwsBucket,
	AwsKey,
	ISODateString,
	PageLimit,
	PageOffset,
} from "#/types/general";
import type { ChatTools } from "#/types/notebook";

export type OrganizationUuid = Tagged<string, "OrganizationUuid">;
export type OrganizationId = Tagged<number, "OrganizationId">;

export enum OrganizationMemberRole {
	Admin = "ADMIN",
	User = "USER",
}

export const ORGANIZATION_MEMBER_ROLES = Object.values(OrganizationMemberRole);

export type OrganizationMember = {
	organization: { id: OrganizationId };
	role: OrganizationMemberRole;
	created_at: ISODateString;
	updated_at: ISODateString;
	user: User;
};

export type OrgMemberWithRole = User & {
	role: OrganizationMemberRole;
};

export type Organization = {
	whitelabel_s3_bucket: AwsBucket | null;
	show_whitelabel_text_or_image: boolean;
	default_chat_tools?: Array<ChatTools>;
	all_tool_options?: Array<ChatTools>;
	whitelabel_s3_key: AwsKey | null;
	logo_s3_bucket: AwsBucket | null;
	use_whitelabel_image: boolean;
	logo_s3_key: AwsKey | null;
	whitelabel_name: string;
	uuid: OrganizationUuid;
	show_logo: boolean;
	id: OrganizationId;
	name: string;
	owner: User;
	members: {
		users: Array<OrgMemberWithRole>;
		offset: PageOffset;
		limit: PageLimit;
		total: number;
	};
};
