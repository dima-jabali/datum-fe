import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import {
	FilterOperator,
	type Filter,
} from "#/components/table-for-block/filters/utilityTypes";
import { useSetAnd_or_Or } from "#/components/table-for-block/table-header/helper-filter-hooks";
import { isAParent } from "#/components/table-for-block/table-header/filters-to-be-applied/helpers";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";

type Props = {
	isSecondInARow?: boolean;
	filter: Filter;
};

export function PopoverFor_AND_or_OR({ filter, isSecondInARow }: Props) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const setAnd_or_Or = useSetAnd_or_Or();

	const selectAndClose = (newValue: FilterOperator): void => {
		setAnd_or_Or(filter, newValue);
		setIsPopoverOpen(false);
	};

	const filterOperator =
		isAParent(filter) && !isSecondInARow
			? filter.filterOperator
			: filter.parent?.filterOperator || FilterOperator.AND;

	return (
		<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<PopoverTrigger className="inline-flex justify-between items-center h-8 w-full border border-border-smooth py-1 px-2 button-hover rounded">
				{filterOperator}

				<ChevronDownIcon className="size-4 text-primary" />
			</PopoverTrigger>

			<PopoverContent className="min-w-min items-start justify-start text-sm">
				<button
					className="flex justify-start items-center w-full gap-2 rounded py-1 px-2 button-hover data-[default-checked=true]:bg-button-active"
					data-default-checked={filterOperator === FilterOperator.AND}
					onPointerDown={() => selectAndClose(FilterOperator.AND)}
				>
					<div className="flex flex-col justify-center items-start w-full">
						<span>And</span>

						<p className="text-muted">All filters must match</p>
					</div>
				</button>

				<button
					className="flex justify-start items-center w-full gap-2 rounded py-1 px-2 button-hover data-[default-checked=true]:bg-button-active"
					data-default-checked={filterOperator === FilterOperator.OR}
					onPointerDown={() => selectAndClose(FilterOperator.OR)}
				>
					<div className="flex flex-col justify-center items-start w-full">
						<span>Or</span>

						<p className="text-muted">At least one filter must match</p>
					</div>
				</button>
			</PopoverContent>
		</Popover>
	);
}
