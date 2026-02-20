import { useQuery } from "@tanstack/react-query";

import { useGetAllOrganizations } from "#/hooks/get/use-get-all-organizations";
import { useCreateOrganization } from "#/hooks/mutation/use-create-org";
import { generalCtx } from "#/contexts/general/ctx";
import { isValidNumber } from "#/lib/utils";

export function useSetOrgToFirst() {
	const urlOrgId = generalCtx.use.organizationId();
	const createOrg = useCreateOrganization();
	const allOrgs = useGetAllOrganizations();

	useQuery({
		enabled: allOrgs.length > 0 && !isValidNumber(urlOrgId),
		queryKey: ["set-org-to-first", urlOrgId],
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		async queryFn() {
			const firstOrganization = allOrgs[0];

			if (firstOrganization) {
				generalCtx.setState({
					organizationId: firstOrganization.id,
				});
			}

			return null;
		},
	});

	useQuery({
		queryKey: ["create-org-if-no-orgs"],
		enabled: allOrgs.length === 0,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		async queryFn() {
			console.log("No organizations found, creating a new one.");

			await createOrg.mutateAsync({
				name: "My Organization",
			});

			return null;
		},
	});
}
