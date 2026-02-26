import { CalendarIcon, CaseSensitive } from "lucide-react";
import { toast } from "sonner";
import {
	lazy,
	type SetStateAction,
	Suspense,
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import { FilterType, type ChildFilter } from "../filters/utilityTypes";
import { useSetCaseSensitive, useSetFilterValue } from "./helper-filter-hooks";
import { Input } from "#/components/ui/input";
import { LOADER } from "#/components/loader";

type Props = { childFilter: ChildFilter };

const NUMBER_COLUMN_TYPE = ["int64", "float64"];
const BOOLEAN_COLUMN_TYPE = ["bool"];

enum InputType {
	BOOLEAN = "boolean",
	NUMBER = "number",
	TEXT = "text",
}

function isValidDate(date: unknown): date is Date {
	return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Native replacement for date-fns 'format(date, "dd/LL/yyyy HH:mm")'
 */
function formatToServer(date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");

	return (
		`${pad(date.getDate())}/` +
		`${pad(date.getMonth() + 1)}/` +
		`${date.getFullYear()} ` +
		`${pad(date.getHours())}:${pad(date.getMinutes())}`
	);
}

const DayPicker = lazy(async () => ({
	default: (await import("react-day-picker")).DayPicker,
}));

function getFilterValueInputType(columnType: ChildFilter["column"]["type"]) {
	const isNumber = NUMBER_COLUMN_TYPE.includes(columnType as string);

	if (isNumber) {
		return InputType.NUMBER;
	}

	const isBoolean = BOOLEAN_COLUMN_TYPE.includes(columnType as string);

	if (isBoolean) {
		return InputType.BOOLEAN;
	}

	return InputType.TEXT;
}

export function ValueInput({ childFilter }: Props) {
	// The ones below are for when there are TWO calendars in a row
	const [isSecondDatePickerOpen, setIsSecondDatePickerOpen] = useState(false);
	const [isFirstDatePickerOpen, setIsFirstDatePickerOpen] = useState(false);
	const [secondDateSelected, setSecondDateSelected] = useState<Date>();
	const [firstDateSelected, setFirstDateSelected] = useState<Date>();
	const [secondTimeValue, setSecondTimeValue] = useState("");
	const [firstTimeValue, setFirstTimeValue] = useState("");

	// The ones below are for when there is only ONE calendar in a row
	const [isSingleDatePickerOpen, setIsSingleDatePickerOpen] = useState(false);
	const [singleDateSelected, setSingleDateSelected] = useState<Date>();
	const [singleTimeValue, setSingleTimeValue] = useState("");

	const inputType = useMemo(
		() => getFilterValueInputType(childFilter.column.type),
		[childFilter.column.type],
	);

	const setCaseSensitive = useSetCaseSensitive();
	const setFilterValue = useSetFilterValue();

	const value = (() => {
		if (
			typeof childFilter.value === "boolean" ||
			typeof childFilter.value === "object"
		) {
			return `${childFilter.value}`;
		} else if (typeof childFilter.value === "number") {
			return childFilter.value;
		} else if (typeof childFilter.value !== "undefined") {
			return `${childFilter.value}`;
		} else return undefined;
	})();

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (inputType === InputType.NUMBER) {
			setFilterValue(Number(e.target.value), childFilter);
		} else {
			setFilterValue(e.target.value, childFilter);
		}
	}

	function handleInputChange(
		day: Date,
		setTimeValue: (value: SetStateAction<Date | undefined>) => void,
	) {
		const date = new Date(day);

		setTimeValue(isValidDate(date) ? date : undefined);
	}

	function handleChangeCaseSensitive() {
		setCaseSensitive(!childFilter.caseSensitive, childFilter);
	}

	useEffect(() => {
		if (!(secondDateSelected && firstDateSelected)) return;

		const from = new Date(firstDateSelected);
		{
			const [hour = "", minute = ""] = firstTimeValue.split(":");
			from.setHours(Number(hour), Number(minute));
		}

		const to = new Date(secondDateSelected);
		{
			const [hour = "", minute = ""] = secondTimeValue.split(":");
			to.setHours(Number(hour), Number(minute));
		}

		const isFromDateValid = isValidDate(from);
		const isToDateValid = isValidDate(to);

		if (!isFromDateValid || !isValidDate(to)) {
			if (!isFromDateValid) {
				toast.error(`Invalid date: from ${from}`, {
					description: "Please select a valid date",
				});
			}
			if (!isToDateValid) {
				toast.error(`Invalid date: to ${to}`, {
					description: "Please select a valid date",
				});
			}

			return;
		}

		setFilterValue(
			{
				from: formatToServer(firstDateSelected),
				to: formatToServer(secondDateSelected),
			},
			childFilter,
		);
	}, [
		secondDateSelected,
		firstDateSelected,
		secondTimeValue,
		firstTimeValue,
		childFilter,
		setFilterValue,
	]);

	useEffect(() => {
		if (!singleDateSelected) return;

		const [hour = "", minute = ""] = firstTimeValue.split(":");
		const date = new Date(singleDateSelected);

		date.setHours(Number(hour), Number(minute));

		if (!isValidDate(date)) {
			toast.error(`Invalid date: ${date}`, {
				description: "Please select a valid date",
			});

			return;
		}

		setFilterValue(formatToServer(date), childFilter);
	}, [childFilter, firstTimeValue, setFilterValue, singleDateSelected]);

	switch (childFilter.column.type) {
		case FilterType.timedelta:
			return (
				<div className="flex items-centermin-h-[31px]">
					<NativePopover
						onOpenChange={setIsFirstDatePickerOpen}
						isOpen={isFirstDatePickerOpen}
					>
						<div className="border-table-separator bg-input-bg text-font-color flex flex-col gap-1 rounded-sm border p-1 ">
							<div className="flex h-[31px] w-full items-center justify-between gap-2 pr-1">
								<p className="w-full">
									{firstDateSelected
										? firstDateSelected.toLocaleDateString()
										: "From"}
								</p>

								<NativePopoverTrigger>
									<CalendarIcon className="stroke-primary/60" />
								</NativePopoverTrigger>
							</div>

							<Input
								onChange={(e) => setFirstTimeValue(e.target.value)}
								value={firstTimeValue}
								className="h-[31px]"
								placeholder="From"
								type="time"
							/>
						</div>

						<NativePopoverContent>
							{isFirstDatePickerOpen ? (
								<Suspense fallback={LOADER}>
									<DayPicker
										onDayClick={(day) => {
											handleInputChange(day, setFirstDateSelected);
											setIsFirstDatePickerOpen(false);
										}}
										selected={firstDateSelected}
										mode="single"
										required
									/>
								</Suspense>
							) : null}
						</NativePopoverContent>
					</NativePopover>
					&nbsp;-&nbsp;
					<NativePopover
						onOpenChange={setIsSecondDatePickerOpen}
						isOpen={isSecondDatePickerOpen}
					>
						<div className="border-table-separator bg-input-bg text-font-color flex flex-col gap-1 rounded-sm border p-1 ">
							<div className="flex h-[31px] w-full items-center justify-between gap-1 pr-1">
								<p className="w-full">
									{secondDateSelected
										? secondDateSelected.toLocaleDateString()
										: "To"}
								</p>

								<NativePopoverTrigger>
									<CalendarIcon className="stroke-white/60" />
								</NativePopoverTrigger>
							</div>

							<Input
								onChange={(e) => setSecondTimeValue(e.target.value)}
								value={secondTimeValue}
								className="h-[31px]"
								placeholder="From"
								type="time"
							/>
						</div>

						<NativePopoverContent>
							<DayPicker
								onDayClick={(day) => {
									handleInputChange(day, setSecondDateSelected);
									setIsSecondDatePickerOpen(false);
								}}
								selected={secondDateSelected}
								mode="single"
								required
							/>
						</NativePopoverContent>
					</NativePopover>
				</div>
			);

		case FilterType.datetime64:
			return (
				<NativePopover
					onOpenChange={setIsSingleDatePickerOpen}
					isOpen={isSingleDatePickerOpen}
				>
					<div className="border-table-separator bg-input-bg text-font-color flex flex-col gap-1 rounded-sm border p-1 ">
						<div className="flex h-[31px] w-full items-center justify-between gap-1 pr-1">
							<p className="w-full">
								{singleDateSelected
									? singleDateSelected.toLocaleDateString()
									: "To"}
							</p>

							<NativePopoverTrigger>
								<CalendarIcon className="stroke-white/60" />
							</NativePopoverTrigger>
						</div>

						<Input
							onChange={(e) => setSingleTimeValue(e.target.value)}
							value={singleTimeValue}
							className="h-[31px]"
							placeholder="From"
							type="time"
						/>
					</div>

					<NativePopoverContent>
						<DayPicker
							onDayClick={(day) => {
								handleInputChange(day, setSingleDateSelected);
								setIsSingleDatePickerOpen(false);
							}}
							selected={secondDateSelected}
							mode="single"
							required
						/>
					</NativePopoverContent>
				</NativePopover>
			);

		default:
			return (
				<div className="flex gap-2">
					<Input
						className="h-[31px]"
						onChange={onChange}
						placeholder="Value"
						type={inputType}
						value={value}
						required
					/>

					{inputType === InputType.TEXT ? (
						<button
							className="aspect-square rounded-xs border h-[31px] border-transparent transition-none data-[is-case-sensitive=true]:border-link-visited/70 data-[is-case-sensitive=true]:bg-button-active button-hover flex items-center justify-center p-1"
							data-is-case-sensitive={childFilter.caseSensitive}
							onPointerUp={handleChangeCaseSensitive}
							title="Match case"
							type="button"
						>
							<CaseSensitive className="size-5 text-primary" />
						</button>
					) : null}
				</div>
			);
	}
}
