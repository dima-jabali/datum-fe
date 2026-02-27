import type { PostHogConfig } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { Aside } from "#/components/aside";
import { ChatContent } from "#/components/chat-content";
import { AllContexts } from "#/contexts/all-contexts";
import { MakeQueryClientProvider } from "#/contexts/query-client-provider";
import { RerenderTreeProvider } from "#/contexts/use-rerender-tree";
import { HandleIfUserHasChanged } from "#/lib/handle-if-user-has-changed";

const isProduction = import.meta.env.MODE === "production";

const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;

if (!POSTHOG_HOST || !POSTHOG_KEY) {
	throw new Error(
		"PostHog host or key is not defined. Please check your environment variables.",
	);
}

const POSTHOG_OPTIONS: Partial<PostHogConfig> = {
	name: "Better Brain Chat App PostHog Client",
	session_idle_timeout_seconds: 60 * 60 * 2, // 2 hours
	enable_recording_console_log: true,
	capture_performance: true,
	capture_dead_clicks: true,
	capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
	capture_pageleave: true,
	api_host: POSTHOG_HOST,
	defaults: "2025-05-24",
	capture_heatmaps: true,
	capture_pageview: true,
	enable_heatmaps: true,
	autocapture: true,
	session_recording: {
		recordCrossOriginIframes: false,
		recordHeaders: true,
		recordBody: true,
		maskCapturedNetworkRequestFn(data) {
			return data;
		},
	},
};

export function App() {
	const appWithoutPosthog = (
		<MakeQueryClientProvider>
			<AllContexts>
				<HandleIfUserHasChanged>
					<RerenderTreeProvider>
						<Main />
					</RerenderTreeProvider>
				</HandleIfUserHasChanged>
			</AllContexts>
		</MakeQueryClientProvider>
	);

	return isProduction ? (
		<PostHogProvider options={POSTHOG_OPTIONS} apiKey={POSTHOG_KEY!}>
			{appWithoutPosthog}
		</PostHogProvider>
	) : (
		appWithoutPosthog
	);
}

function Main() {
	return (
		<main className="grid grid-rows-1 [grid-template-columns:0.01fr_1fr] [grid-template-areas:'aside_main'] h-dvh w-dvw overflow-hidden bg-background">
			<Aside />

			<ChatContent />
		</main>
	);
}
