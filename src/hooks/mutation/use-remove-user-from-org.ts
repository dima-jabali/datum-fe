import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { queryKeyFactory } from "../query-key-factory";
import { clientAPI_V1 } from "#/api/axios";

type RemoveMemberFromOrgRequest = {
	userId: string;
	orgId: string;
};

export type RemoveMemberFromOrgResponse = AxiosResponse<
	RemoveMemberFromOrgRequest,
	undefined
>;

const mutationKey = queryKeyFactory.delete["user-from-org"].queryKey;

export function useRemoveUserFromOrganizationMutation() {
	return useMutation<
		RemoveMemberFromOrgResponse,
		Error,
		RemoveMemberFromOrgRequest
	>({
		mutationKey,

		async mutationFn(arg: RemoveMemberFromOrgRequest) {
			const path = `/organizations/${arg.orgId}/users/${arg.userId}`;

			return await clientAPI_V1.delete<
				RemoveMemberFromOrgRequest,
				RemoveMemberFromOrgResponse
			>(path);
		},

		meta: {
			invalidateQuery: queryKeyFactory.get["all-organizations"],
			cancelQuery: queryKeyFactory.get["all-organizations"],
		},
	});
}
