import { __SourceCitationContextProvider } from "#/contexts/source-citation/context";
import { generalCtx } from "#/contexts/general/ctx";

export function SourceCitationContextProvider({
	children,
}: React.PropsWithChildren) {
	const notebookId = generalCtx.use.notebookId();
	const orgId = generalCtx.use.organizationId();

	return (
		<__SourceCitationContextProvider key={`${orgId}${notebookId}`}>
			{children}
		</__SourceCitationContextProvider>
	);
}
