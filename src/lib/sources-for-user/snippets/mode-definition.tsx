import { useState } from "react";

import {
	NativeDialog,
	NativeDialogContent,
	NativeDialogHeader,
	NativeDialogTrigger,
} from "#/components/native-dialog";
import { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { Textarea } from "#/components/ui/textarea";
import { CodeBlock } from "#/components/Markdown/code-block";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.ModeDefinition }
	>;
};

export function ModeDefinitionTitleTrigger({
	normalizedSource: {
		values: { query, connection_type, description },
	},
}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<NativeDialog onOpenChange={setIsOpen} isOpen={isOpen}>
			<NativeDialogTrigger
				className="max-h-full break-all truncate group-data-[is-drawer]/drawer:font-bold group-data-[is-drawer]/drawer:text-base group-data-[is-drawer]/drawer:link group-data-[is-drawer]/drawer:hover:underline"
				title={query}
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				{query}
			</NativeDialogTrigger>

			{isOpen ? (
				<NativeDialogContent>
					<NativeDialogHeader className="text-xl font-bold">
						Source info
					</NativeDialogHeader>

					<dl className="flex gap-1 text-primary">
						<dt>Connection type</dt>
						<dd>{connection_type}</dd>
					</dl>

					<Textarea
						className="my-6 overflow-auto"
						title="Source description"
						value={description}
						disabled
					/>

					<CodeBlock text={query} lang="sql" />
				</NativeDialogContent>
			) : null}
		</NativeDialog>
	);
}
