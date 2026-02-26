import { useMutation } from "@tanstack/react-query";

import type { ISODateString } from "#/types/general";
import type {
	OrganizationId,
	OrganizationMemberRole,
} from "#/types/organization";
import type { User } from "#/types/user";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";

type SendInviteToEmailRequest = {
	orgId: OrganizationId;
	first_name: string;
	last_name: string;
	email: string;
};

export type OrganizationMember = {
	organization: { id: OrganizationId };
	role: OrganizationMemberRole;
	created_at: ISODateString;
	updated_at: ISODateString;
	user: User;
};

type SendInviteToEmailResponse = {
	organization_member: OrganizationMember;
	user_notifications: Array<string>;
};

const mutationKey = queryKeyFactory.post["invite-user-to-org"].queryKey;

export function useInviteUserToOrganizationMutation() {
	return useMutation<
		SendInviteToEmailResponse,
		Error,
		SendInviteToEmailRequest
	>({
		mutationKey,

		async mutationFn(arg: SendInviteToEmailRequest) {
			const { orgId, ...body } = arg;

			const path = `/organizations/${orgId}/users`;

			return await clientAPI_V1.post<
				SendInviteToEmailRequest,
				SendInviteToEmailResponse
			>(path, body);
		},

		meta: {
			invalidateQuery: queryKeyFactory.get["all-organizations"],
			cancelQuery: queryKeyFactory.get["all-organizations"],
		},
	});
}
