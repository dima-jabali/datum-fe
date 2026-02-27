import { useSuspenseQuery } from "@tanstack/react-query";

import { queryKeyFactory } from "#/hooks/query-key-factory";
import { GET_WEBSITE_PREVIEW_DATA } from "#/lib/utils";

type PreviewResponse = {
	description: string | undefined;
	contentType: string | undefined;
	siteName: string | undefined;
	author: string | undefined;
	favicons: string[];
	mediaType: string;
	images: string[];
	title: string;
	url: string;
};

export function useGetUrlPreview(url: string) {
	return useSuspenseQuery({
		queryKey: queryKeyFactory.get["url-preview"](url).queryKey,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		staleTime: Infinity,
		gcTime: Infinity, // Maintain on cache
		async queryFn() {
			const formData = new FormData();
			formData.set("formId", GET_WEBSITE_PREVIEW_DATA);
			formData.set("url", url);

			const res = await fetch("/actions", {
				body: formData,
				method: "POST",
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch website preview: ${res.statusText}`);
			}

			const json = await res.json();

			return json as PreviewResponse;
		},
	}).data;
}
