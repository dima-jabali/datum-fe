import { useMutation } from "@tanstack/react-query";

import type { ChatTools } from "#/types/notebook";
import type { Organization, OrganizationId } from "#/types/organization";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";

export type MutateOrganizationRequest = {
	pathParams: {
		organizationId: OrganizationId;
	};
	body: {
		default_chat_tools?: Array<ChatTools>;
		name?: string;
	};
};

export type MutateOrganizationResponse = Organization;

const mutationKey = queryKeyFactory.put["update-organization"].queryKey;

export function useMutateOrganization() {
	return useMutation({
		mutationKey,

		async mutationFn(args: MutateOrganizationRequest) {
			const path = `/organizations/${args.pathParams.organizationId}`;

			const res = await clientAPI_V1.put<MutateOrganizationResponse>(
				path,
				args.body,
			);

			return res.data;
		},

		meta: {
			invalidateQuery: queryKeyFactory.get["all-organizations"],
			errorTitle: "Failed to update organization!",
			successTitle: "Organization updated!",
		},
	});
}
