import { useCallback } from "react";

import { generalCtx } from "#/contexts/general/ctx";
import { useSetOrgToFirst } from "#/hooks/use-set-org-to-first";
import type { Organization } from "#/types/organization";
import { useGetAllOrganizations } from "#/hooks/get/use-get-all-organizations";

export function useCurrentOrganization() {
	const urlOrgId = generalCtx.use.organizationId();

	useSetOrgToFirst();

	const selectCurrentOrganization = useCallback(
		(allOrgs: Array<Organization>) => allOrgs.find(({ id }) => id === urlOrgId),
		[urlOrgId],
	);

	const currentOrganization = useGetAllOrganizations(selectCurrentOrganization);

	return currentOrganization;
}

export function useDownloadedOrganizationId() {
	return useCurrentOrganization()?.id;
}

export function useWithCurrentOrg() {
	const currentOrg = useCurrentOrganization();

	if (!currentOrg) {
		throw new Error("No current organization");
	}

	return currentOrg;
}
