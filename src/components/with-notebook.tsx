import { Fragment } from "react";

import { useWithOrganizationId } from "#/contexts/general/ctx";
import { useDownloadedNotebookUuid } from "#/hooks/get/use-get-notebook";

export function WithNotebook({ children }: React.PropsWithChildren) {
	const notebookUuid = useDownloadedNotebookUuid();
	const organizationId = useWithOrganizationId();

	return (
		<Fragment key={`${notebookUuid}-${organizationId}`}>{children}</Fragment>
	);
}
