import { useCreateNotebookIfOrgHasNone } from "#/hooks/use-create-notebook-if-org-has-none";
import { useSetNotebookToFirst } from "#/hooks/use-set-notebook-to-first";

export function WithNotebookIdAndList({ children }: React.PropsWithChildren) {
	return (
		<WithNotebookList>
			<WithNotebookId>{children}</WithNotebookId>
		</WithNotebookList>
	);
}

function WithNotebookList({ children }: React.PropsWithChildren) {
	const createNotebookIfOrgHasNoneQuery = useCreateNotebookIfOrgHasNone();

	if (createNotebookIfOrgHasNoneQuery.isEnabled) {
		return createNotebookIfOrgHasNoneQuery.data ? children : null;
	}

	return children;
}

function WithNotebookId({ children }: React.PropsWithChildren) {
	const setNotebookToFirstQuery = useSetNotebookToFirst();

	if (setNotebookToFirstQuery.isEnabled) {
		return setNotebookToFirstQuery.data ? children : null;
	}

	return children;
}
