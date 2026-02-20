import { LoaderIcon } from "lucide-react";

import { generalCtx } from "#/contexts/general/ctx";
import { useSetOrgToFirst } from "#/hooks/use-set-org-to-first";
import { isValidNumber } from "#/lib/utils";

export function WithOrganizationIdAndList({
	children,
}: React.PropsWithChildren) {
	const organizationId = generalCtx.use.organizationId();

	useSetOrgToFirst();

	return isValidNumber(organizationId) ? children : <LoaderIcon />;
}
