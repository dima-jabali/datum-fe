import type { BrowserClerk } from "@clerk/clerk-react";

declare global {
	interface Window {
		Clerk: BrowserClerk;
	}
}
