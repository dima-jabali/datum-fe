import {
	useMutation,
	useQueryClient,
	type InvalidateQueryFilters,
	type MutationObserverOptions,
	type QueryFilters,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import type { OrganizationMember } from "#/hooks/mutation/use-invite-user-to-org";
import type {
	OrganizationId,
	OrganizationMemberRole,
} from "#/types/organization";
import type { UserId } from "#/types/user";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";

type UpdateOrgMemberRequest = {
	/** Use it if you want to update the role. Leave empty for adding a user to org */
	role?: OrganizationMemberRole;
	orgId: OrganizationId;
	userId: UserId;
};
type UpdateOrgMemberResponse = AxiosResponse<{
	organization_member: OrganizationMember;
}>;

const ALL_ORGANIZATIONS_QUERY_KEY =
	queryKeyFactory.get["all-organizations"].queryKey;
const mutationKey = queryKeyFactory.put["update-org-user"].queryKey;

const cancelOrInvalidateQueriesParams: QueryFilters | InvalidateQueryFilters = {
	queryKey: ALL_ORGANIZATIONS_QUERY_KEY,
};

export function useUpdateOrgMember() {
	const queryClient = useQueryClient();

	queryClient.setMutationDefaults(mutationKey, {
		async onSuccess() {
			await queryClient.invalidateQueries(cancelOrInvalidateQueriesParams);
		},
		async onMutate() {
			await queryClient.cancelQueries(cancelOrInvalidateQueriesParams);
		},
	} satisfies MutationObserverOptions<
		UpdateOrgMemberResponse,
		Error,
		UpdateOrgMemberRequest
	>);

	return useMutation<UpdateOrgMemberResponse, Error, UpdateOrgMemberRequest>({
		mutationKey,

		async mutationFn(args: UpdateOrgMemberRequest) {
			const path = `/organizations/${args.orgId}/users/${args.userId}`;

			return await clientAPI_V1.put<
				UpdateOrgMemberRequest,
				UpdateOrgMemberResponse
			>(path, args.role ? { role: args.role } : {});
		},

		meta: {
			invalidateQuery: queryKeyFactory.get["all-organizations"],
			cancelQuery: queryKeyFactory.get["all-organizations"],
		},
	});
}
