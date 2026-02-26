import { ChevronDownIcon } from "lucide-react";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import type {
	ChildFilter,
	ColumnInfo,
} from "#/components/table-for-block/filters/utilityTypes";
import {
	matchFilterIcon,
	useColumnFilter,
} from "#/components/table-for-block/table-header/utils";
import { useSelectColumnToFilter } from "#/components/table-for-block/table-header/helper-filter-hooks";

type Props = {
	childFilter: ChildFilter;
};

export function PopoverToSelectColumnToFilter({ childFilter }: Props) {
	const {
		isPopoverOpen,
		searchResults,
		searchString,
		setIsPopoverOpen,
		setSearchString,
	} = useColumnFilter();

	const selectColumnToFilter = useSelectColumnToFilter();

	return (
		<NativePopover onOpenChange={setIsPopoverOpen} isOpen={isPopoverOpen}>
			<NativePopoverTrigger
				className="inline-flex items-center min-w-max gap-2 justify-between min-h-[31px] w-full border border-border-smooth py-1 px-2 button-hover rounded text-sm"
				title="Where should this filter be applied?"
			>
				<div className="flex items-center gap-2">
					{matchFilterIcon(childFilter.column.type)}

					<p className="flex flex-1 text-start">{childFilter.column.name}</p>
				</div>

				<ChevronDownIcon className="size-4 flex-none" />
			</NativePopoverTrigger>

			<NativePopoverContent className="justify-start items-start max-h-[30vh] max-w-72 mobile:max-w-dvw mobile:w-dvw gap-1 p-1 flex-col text-sm">
				<input
					className="flex h-7 justify-start items-center w-full border border-border-smooth rounded px-1 outline-hidden mb-2 flex-none"
					onChange={(e) => setSearchString(e.target.value)}
					placeholder="Search for a column…"
					value={searchString}
					type="search"
				/>

				{searchResults.map((columnInfo) => {
					const col: ColumnInfo = {
						type:
							"type" in columnInfo
								? (columnInfo.type as ColumnInfo["type"])
								: "object",
						name: columnInfo.id,
					};

					return (
						<button
							className="flex justify-start items-center w-full min-h-7 rounded py-1 px-2 button-hover data-[is-selected=true]:bg-button-active gap-2"
							onClick={() => {
								selectColumnToFilter(childFilter, col);
								setIsPopoverOpen(false);
							}}
							data-is-selected={columnInfo.id === childFilter.column.name}
							key={columnInfo.id}
						>
							{matchFilterIcon(col.type)}

							<p className="flex flex-1 text-start">{columnInfo.id}</p>
						</button>
					);
				})}
			</NativePopoverContent>
		</NativePopover>
	);
}
