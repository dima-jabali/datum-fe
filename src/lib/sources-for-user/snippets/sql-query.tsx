import { useState } from "react";

import {
	NativeDialog,
	NativeDialogContent,
	NativeDialogHeader,
	NativeDialogTrigger,
} from "#/components/native-dialog";
import type { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { Textarea } from "#/components/ui/textarea";
import { CodeBlock } from "#/components/Markdown/code-block";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.SqlQuery }
	>;
	titleString: string;
};

export function SqlQueryTitleDialogTrigger({
	normalizedSource: {
		values: { connection_type, connection_id, description },
	},
	titleString,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<NativeDialog onOpenChange={setIsOpen} isOpen={isOpen}>
			<NativeDialogTrigger
				className="max-h-full break-all truncate group-data-[is-drawer]/drawer:font-bold group-data-[is-drawer]/drawer:text-base group-data-[is-drawer]/drawer:link hover:underline"
				title={titleString}
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				{titleString}
			</NativeDialogTrigger>

			{isOpen ? (
				<NativeDialogContent className="min-w-lg">
					<NativeDialogHeader className="text-xl font-bold">
						Source info
					</NativeDialogHeader>

					<dl className="flex flex-col gap-1 text-primary [&_dt]:after:content-[':']">
						<div className="flex gap-1">
							<dt>Connection type</dt>
							<dd>{connection_type}</dd>
						</div>

						<div className="flex gap-1">
							<dt>Connection ID</dt>
							<dd>{connection_id}</dd>
						</div>
					</dl>

					<Textarea
						className="my-6 overflow-auto"
						title="Source description"
						value={description}
						disabled
					/>

					<CodeBlock text={titleString} lang="sql" />
				</NativeDialogContent>
			) : null}
		</NativeDialog>
	);
}
