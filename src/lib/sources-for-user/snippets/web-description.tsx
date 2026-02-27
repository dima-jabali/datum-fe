import ReactMarkdown from "react-markdown";

import { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.Web }
	>;
};

export function WebDescription({
	normalizedSource: {
		values: { text },
	},
}: Props) {
	return (
		<details>
			<summary className="text-xs hover:underline underline-offset-2 cursor-pointer my-1">
				Text content
			</summary>

			<section className="w-[95%] border border-border-smooth wrap-anywhere rounded-md bg-slate-800 flex flex-col max-h-96 simple-scrollbar p-2">
				<ReactMarkdown>{text}</ReactMarkdown>
			</section>
		</details>
	);
}
