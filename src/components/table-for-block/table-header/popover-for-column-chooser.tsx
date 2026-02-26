import { useReducer, useState } from "react";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import type { FilterType } from "#/components/table-for-block/filters/utilityTypes";
import { useColumnFilter } from "#/components/table-for-block/table-header/utils";

export type Col = {
	visibleIndex: number;
	dataField: string;
	type?: FilterType;
	visible: boolean;
	dataType: string;
	name: string;
};

export function PopoverForColumnChooser() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<NativePopover isOpen={isOpen} onOpenChange={setIsOpen}>
			<NativePopoverTrigger
				className="text-xs border border-transparent button-hover px-2 py-0.5 rounded-sm text-muted-foreground"
				title="Choose colums to display"
			>
				Display
			</NativePopoverTrigger>

			{isOpen ? (
				<NativePopoverContent className="max-h-48">
					<Content />
				</NativePopoverContent>
			) : null}
		</NativePopover>
	);
}

function Content() {
	const [, forceRender] = useReducer((prev) => !prev, true);

	const { searchResults, searchString, setSearchString } = useColumnFilter();

	return (
		<>
			<input
				className="flex justify-start items-center h-8 flex-none w-full border border-border-smooth rounded px-1 outline-hidden"
				onChange={(e) => setSearchString(e.target.value)}
				placeholder="Search for a column…"
				value={searchString}
				type="search"
			/>

			{searchResults.map((column, index) => {
				function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
					column.getToggleVisibilityHandler()(e);

					requestAnimationFrame(forceRender);
				}

				return (
					<label
						className="flex w-full cursor-pointer gap-3 rounded-sm py-0.5 px-2 hover:bg-button-hover focus:bg-button-hover active:bg-button-active"
						key={index}
					>
						<input
							checked={column.getIsVisible()}
							onChange={handleOnChange}
							type="checkbox"
							id={column.id}
						/>

						{column.id}
					</label>
				);
			})}
		</>
	);
}
