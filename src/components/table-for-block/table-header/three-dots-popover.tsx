import { Ellipsis, MinusIcon } from "lucide-react";
import { useState } from "react";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import type { Filter } from "#/components/table-for-block/filters/utilityTypes";
import { useDeleteFilter } from "#/components/table-for-block/table-header/helper-filter-hooks";
import { AddFilterButtons } from "#/components/table-for-block/table-header/add-filter-popover";

type Props = {
	filter: Filter;
};

export function ThreeDotsPopover({ filter }: Props) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const deleteFilter = useDeleteFilter();

	function handleDeleteFilter() {
		deleteFilter(filter);
	}

	return (
		<NativePopover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<NativePopoverTrigger className="inline-flex justify-center items-center size-[31px] aspect-square py-1 px-2 button-hover rounded text-sm">
				<Ellipsis className="size-5 text-primary" />
			</NativePopoverTrigger>

			<NativePopoverContent className="justify-start items-start min-w-min gap-1">
				<button
					className="flex justify-start items-center w-full gap-2 rounded border border-border-smooth py-1 px-2 button-hover text-sm disabled:opacity-50"
					onClick={handleDeleteFilter}
				>
					<MinusIcon className="size-4 text-primary" />
					Delete filter
				</button>

				<AddFilterButtons
					parentFilter={filter.parent}
					filterAbove={filter}
					flexStart
				/>
			</NativePopoverContent>
		</NativePopover>
	);
}
