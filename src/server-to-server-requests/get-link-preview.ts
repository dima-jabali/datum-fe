import { getLinkPreview } from "link-preview-js";
import { lookup } from "node:dns";

export async function getLinkPreviewAction(url: string): Promise<unknown> {
	if (!URL.canParse(url)) {
		throw new Error("Invalid URL");
	}

	const previewData = await getLinkPreview(url, {
		timeout: 10_000,

		followRedirects: `manual`,
		handleRedirects(baseURL: string, forwardedURL: string) {
			const forwardedURLObj = new URL(forwardedURL);
			const urlObj = new URL(baseURL);

			if (
				forwardedURLObj.hostname === urlObj.hostname ||
				forwardedURLObj.hostname === "www." + urlObj.hostname ||
				"www." + forwardedURLObj.hostname === urlObj.hostname
			) {
				return true;
			} else {
				return false;
			}
		},

		async resolveDNSHost(url: string) {
			return new Promise((resolve, reject) => {
				const hostname = new URL(url).hostname;

				lookup(hostname, (err, address) => {
					if (err) {
						reject(err);

						return;
					}

					resolve(address); // if address resolves to localhost or '127.0.0.1' library will throw an error
				});
			});
		},
	});

	return previewData;
}
