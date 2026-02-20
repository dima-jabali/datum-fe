import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export function EmptyFallbackSuspense({ children }: React.PropsWithChildren) {
	return (
		<Suspense fallback={null}>
			<QueryErrorResetBoundary>
				<ErrorBoundary fallback={null}>{children}</ErrorBoundary>
			</QueryErrorResetBoundary>
		</Suspense>
	);
}
