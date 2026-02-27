import { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.Airtable }
	>;
};

export function AirtableTable({
	normalizedSource: {
		values: { airtable_connection_id, base_id, record_id, table_id },
	},
}: Props) {
	return (
		<details>
			<summary
				className="hover:underline underline-offset-2 cursor-pointer my-1 text-xs"
				title="More info about this Airtable source"
			>
				More info
			</summary>

			<section className="flex max-w-full flex-col gap-2 overflow-auto data-[on-hover-ui=true]:p-2 simple-scrollbar text-xs border border-border-smooth rounded-lg">
				<table>
					<tbody className="[&>tr]:even:bg-alt-row">
						<tr>
							<th className="px-2 text-left">Connection ID</th>

							<td>{airtable_connection_id}</td>
						</tr>

						<tr>
							<th className="px-2 text-left">Base ID</th>

							<td>{base_id}</td>
						</tr>

						<tr>
							<th className="px-2 text-left">Record ID</th>

							<td>{record_id}</td>
						</tr>

						<tr>
							<th className="px-2 text-left">Table ID</th>

							<td>{table_id}</td>
						</tr>
					</tbody>
				</table>
			</section>
		</details>
	);
}

export function AirtableDescription({
	normalizedSource: {
		values: { fields },
	},
}: Props) {
	return (
		<div className="flex max-w-full flex-col gap-2 overflow-auto data-[on-hover-ui=true]:p-2 simple-scrollbar text-xs border border-border-smooth rounded-lg">
			<table>
				<tbody>
					{Object.entries(fields).map(([key, value]) => (
						<tr className="even:bg-alt-row" key={key}>
							<th className="px-2 text-left max-h-[2lh] whitespace-nowrap">
								{key}
							</th>

							<td className="pr-2">{`${value}`}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
