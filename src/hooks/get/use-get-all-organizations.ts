import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
	OrganizationMemberRole,
	type Organization,
} from "#/types/organization";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { createISODate, identity } from "#/lib/utils";
import { useWithOrganizationId } from "#/contexts/general/ctx";
import type { UserId } from "#/types/user";
import { useGetUser } from "#/hooks/get/use-get-user";

export type GetOrganizationsResponse = { results: Array<Organization> };

const fetchAllOrgsQueryOptions = queryKeyFactory.get["all-organizations"];

export function useGetAllOrganizations<
	SelectedData = GetOrganizationsResponse["results"],
>(
	select: (
		data: GetOrganizationsResponse["results"],
	) => SelectedData = identity<
		GetOrganizationsResponse["results"],
		SelectedData
	>,
) {
	useGetUser();

	return useSuspenseQuery({
		staleTime: Infinity,
		gcTime: Infinity, // Maintain on cache
		select,
		...fetchAllOrgsQueryOptions,
	}).data;
}

export function useOrgMember(enabled: boolean) {
	const organizationId = useWithOrganizationId();
	const user = useGetUser();

	const queryOptions = useMemo(
		() => queryKeyFactory.get["org-member"](organizationId, user.id),
		[organizationId, user],
	);

	return useQuery({
		placeholderData: {
			organization: { id: organizationId },
			role: OrganizationMemberRole.User,
			created_at: createISODate(),
			updated_at: createISODate(),
			user,
		},
		staleTime: Infinity,
		gcTime: Infinity, // Maintain on cache
		enabled,
		...queryOptions,
	}).data;
}

export function useUserRoleInCurrOrg() {
	const organizationId = useWithOrganizationId();
	const userId = useGetUser().id;

	const selectUserRoleInOrg = useCallback(
		(data: GetOrganizationsResponse["results"]) => {
			const currOrg = data.find((org) => org.id === organizationId);

			return currOrg ? userRoleInOrg(currOrg, userId) : undefined;
		},
		[organizationId, userId],
	);

	const userRoleInAlreadyDowloadedOrgMembers =
		useGetAllOrganizations(selectUserRoleInOrg);

	const orgMember = useOrgMember(
		userRoleInAlreadyDowloadedOrgMembers === undefined,
	)!;

	return userRoleInAlreadyDowloadedOrgMembers ?? orgMember.role;
}

export function userRoleInOrg(org: Organization, userId: UserId) {
	const member = org.members.users.find((u) => u.id === userId);

	return member?.role;
}
