import {
	ClerkProvider,
	SignedIn,
	SignedOut,
	SignIn,
	useAuth,
} from "@clerk/clerk-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { memo } from "react";
import { Toaster } from "sonner";

import { generalCtx } from "#/contexts/general/ctx";
import { queryClient } from "#/contexts/query-client";
import { WebsocketProvider } from "#/contexts/websocket/websocket-provider";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
	throw new Error(
		"import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined",
	);
}

export const AllContexts = memo(function AllContexts({
	children,
}: React.PropsWithChildren) {
	const signedInNodes = (
		<>
			<ReactQueryDevtools initialIsOpen={false} />

			<Toaster />

			<WebsocketProvider>{children}</WebsocketProvider>
		</>
	);

	return (
		<WithClerkProvider>
			<WithClerk>
				<SignedIn>{signedInNodes}</SignedIn>

				<SignedOut>
					<div className="h-dvh w-dvw flex items-center justify-center text-black">
						<SignIn />
					</div>

					<ClearAllStoresOnSignedOut />
				</SignedOut>
			</WithClerk>
		</WithClerkProvider>
	);
});

function WithClerkProvider({ children }: React.PropsWithChildren) {
	if (!CLERK_PUBLISHABLE_KEY) {
		throw new Error(
			"import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined",
		);
	}

	return (
		<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
			{children}
		</ClerkProvider>
	);
}

function WithClerk({ children }: React.PropsWithChildren) {
	const { isLoaded } = useAuth();

	return isLoaded ? children : null;
}

function ClearAllStoresOnSignedOut() {
	generalCtx.setState(generalCtx.getInitialState());
	// allEditorsInfo.clear();
	queryClient.clear();

	return null;
}
