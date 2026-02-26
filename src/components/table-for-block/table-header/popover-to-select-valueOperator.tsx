import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import {
	AVAILABLE_VALUE_OPERATORS_FOR_TYPES,
	type ChildFilter,
	type ValueOperator,
} from "#/components/table-for-block/filters/utilityTypes";
import { useSetValueOperator } from "#/components/table-for-block/table-header/helper-filter-hooks";

type Props = {
	filter: ChildFilter;
};

export function PopoverToSelectValueOperator({ filter }: Props) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const setValueOperator = useSetValueOperator();

	function selectAndClose(valueOperator: ValueOperator): void {
		setValueOperator(filter, valueOperator);
		setIsPopoverOpen(false);
	}

	return (
		<NativePopover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<NativePopoverTrigger
				className="inline-flex justify-between items-center min-h-[31px] w-full border border-border-smooth py-1 px-2 button-hover rounded text-sm"
				title="Choose an operator"
			>
				{filter.valueOperator}

				<ChevronDownIcon className="size-4 flex-none" />
			</NativePopoverTrigger>

			<NativePopoverContent className="justify-start items-start min-w-min w-max max-h-[40vh]">
				{AVAILABLE_VALUE_OPERATORS_FOR_TYPES[
					filter.column.type as keyof typeof AVAILABLE_VALUE_OPERATORS_FOR_TYPES
				]?.map((valueOperator) => (
					<button
						className="flex justify-start items-center w-full gap-2 rounded py-1 px-2 button-hover data-[default-checked=true]:bg-button-active text-sm"
						data-default-checked={valueOperator === filter.valueOperator}
						onPointerUp={() => selectAndClose(valueOperator)}
						data-value={valueOperator}
						key={valueOperator}
					>
						{valueOperator}
					</button>
				)) || <p className="p-2">Select a column first</p>}
			</NativePopoverContent>
		</NativePopover>
	);
}
