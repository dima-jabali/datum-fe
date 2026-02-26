import {
	Bot,
	BrainCircuit,
	CheckCheck,
	CheckIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	ClipboardIcon,
	X,
} from "lucide-react";

export const ANIMATED_DOTS = (
	<span className="ml-0.5 min-w-fit" title="Loading…">
		<span className="dot-with-animation bg-muted-foreground" />
		<span className="dot-with-animation bg-muted-foreground" />
		<span className="dot-with-animation bg-muted-foreground" />
	</span>
);

export const DOUBLE_CHECK = (
	<CheckCheck
		className="my-auto ml-2 size-4 stroke-positive flex-none"
		aria-label="Done"
	/>
);
export const CHECK_ICON = <CheckIcon className="size-4 stroke-positive" />;
export const CLIPBOARD_ICON = <ClipboardIcon className="size-4 stroke-2" />;
export const CHEVRON_RIGHT = <ChevronRightIcon className="size-3" />;
export const X_ICON = <X className="size-4 stroke-destructive" />;

export const THINKING_SPAN = (
	<span
		className="flex font-semibold z-10 items-center justify-start w-full text-xs"
		title="To show more, set 'Show intermediate messages' to true on settings"
	>
		<BrainCircuit className="stroke-muted-foreground size-3" />

		<span>&nbsp;Thinking</span>

		{ANIMATED_DOTS}
	</span>
);

export const SORT_ICONS = {
	desc: (
		<span className="flex h-7 flex-col items-center justify-center -space-y-[4px]">
			<ChevronUpIcon className="size-3 opacity-0" />

			<ChevronDownIcon className="size-3 stroke-yellow-600" />
		</span>
	),
	asc: (
		<span className="flex h-7 flex-col items-center justify-center -space-y-[4px]">
			<ChevronUpIcon className="size-3 stroke-positive" />

			<ChevronDownIcon className="size-3 opacity-0" />
		</span>
	),
	false: (
		<span className="flex h-7 flex-col items-center justify-center -space-y-[4px]">
			<ChevronUpIcon className="size-3 stroke-primary" />

			<ChevronDownIcon className="size-3 stroke-primary" />
		</span>
	),
};

export const BOT_IMG = (
	<div className="size-8 rounded-full bg-indigo-800 p-1.5">
		<Bot className="size-5 text-white" />
	</div>
);
