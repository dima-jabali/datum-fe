import { useState } from "react";

import {
	NativeDialog,
	NativeDialogContent,
	NativeDialogHeader,
	NativeDialogTrigger,
} from "#/components/native-dialog";
import { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { CodeBlock } from "#/components/Markdown/code-block";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.ModeQuery }
	>;
};

export function ModeQueryTitleTrigger({ normalizedSource }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const {
		values: { query, name, connection_type },
	} = normalizedSource;

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

					<dl className="flex flex-col gap-1 text-primary">
						<div className="flex gap-1">
							<dt>Name:</dt>
							<dd>{name}</dd>
						</div>

						<div className="flex gap-1">
							<dt>Connection type:</dt>
							<dd>{connection_type}</dd>
						</div>
					</dl>

					<CodeBlock text={query} lang="sql" />
				</NativeDialogContent>
			) : null}
		</NativeDialog>
	);
}
