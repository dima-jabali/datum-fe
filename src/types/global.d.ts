import { BrowserClerk } from "@clerk/clerk-react";

declare global {
	interface Window {
		Clerk: BrowserClerk;
	}
}
