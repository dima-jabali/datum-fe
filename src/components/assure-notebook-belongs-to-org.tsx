import { memo } from "react";

import { useDownloadedOrganizationId } from "#/hooks/use-current-organization";
import { useDownloadedNotebookOrganizationId } from "#/hooks/get/use-get-notebook";
import { useGetAllOrganizations } from "#/hooks/get/use-get-all-organizations";
import { isValidNumber } from "#/lib/utils";

export const AssureNotebookBelongsToOrg = memo(
	function AssureNotebookBelongsToOrg({ children }: React.PropsWithChildren) {
		const notebookOrganizationId = useDownloadedNotebookOrganizationId();
		const orgId = useDownloadedOrganizationId();
		const orgs = useGetAllOrganizations();

		if (!isValidNumber(notebookOrganizationId) || !isValidNumber(orgId)) {
			console.log("Notebook or current organization is not defined.", {
				notebookOrganizationId,
				orgId,
			});

			return null;
		}

		if (notebookOrganizationId !== orgId) {
			let msg = "Notebook does not belong to the current organization.";

			const orgNotebookBelongsTo = orgs.find(
				(org) => org.id === notebookOrganizationId,
			);

			if (orgNotebookBelongsTo) {
				msg += `\nThis notebook belongs to the organization "${orgNotebookBelongsTo.name} (${orgNotebookBelongsTo.id})", to which you belong to.\nChange organization in the top right corner to access it.`;
			}

			console.log({
				notebookOrganizationId,
				orgId,
			});

			throw new Error(msg);
		}

		return children;
	},
);
