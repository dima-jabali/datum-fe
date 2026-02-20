import { memo, useId, useMemo } from "react";
import { X } from "lucide-react";

import { createZustandProvider } from "#/contexts/create-zustand-provider";
import { cn, noop } from "#/lib/utils";

type NativePopoverContext = {
	contentStyles: React.CSSProperties;
	buttonStyles: React.CSSProperties;
	isOpen: boolean;
	id: string;
	onOpenChange(newIsOpen: boolean, oldIsOpen: boolean): void;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onToggle(e: React.ToggleEvent<HTMLDivElement>): void;
	openOrCloseInHtml(): void;
	onRendered(): void;
};

export function getPopover(id: string) {
	return document.getElementById(id) as HTMLDivElement | null;
}

const { Provider: NativePopoverContextProvider, useStore } =
	createZustandProvider<NativePopoverContext>(
		function (get, set) {
			return {
				contentStyles: {},
				buttonStyles: {},
				isOpen: false,
				id: "",

				onOpenChange: noop,

				onToggle(e: React.ToggleEvent<HTMLDivElement>) {
					const newIsOpen = e.newState === "open";

					get().setIsOpen(newIsOpen);
				},
				openOrCloseInHtml() {
					requestAnimationFrame(() => {
						const { id, isOpen } = get();
						const popover = getPopover(id);

						if (popover) {
							popover[isOpen ? "showPopover" : "hidePopover"]();
						}
					});
				},
				onRendered() {
					get().openOrCloseInHtml();
				},
				setIsOpen(newIsOpen) {
					const state = get();

					const nextIsOpen =
						typeof newIsOpen === "function"
							? newIsOpen(state.isOpen)
							: newIsOpen;

					set({ isOpen: nextIsOpen });

					if (nextIsOpen !== state.isOpen) {
						state.onOpenChange?.(nextIsOpen, state.isOpen);
						state.openOrCloseInHtml();
					}
				},
			};
		},
		{
			name: "popover-html",
			runAfterCreation(store) {
				store.subscribe(
					(state) => state.id,
					(id) => {
						const anchorName = `--anchor-${id}`;

						store.setState({
							contentStyles: { positionAnchor: anchorName },
							buttonStyles: { anchorName },
						});
					},
				);
			},
		},
	);

/**
 * Synchronizes props to the Zustand store without useEffect.
 */
function SyncNativePopoverValues({
	isOpen,
	id,
	onOpenChange,
}: {
	onOpenChange(open: boolean): void;
	isOpen: boolean;
	id: string;
}) {
	const store = useStore();

	// Use a single-shot logic or compare to avoid infinite loops
	const state = store.getState();

	if (
		state.onOpenChange !== onOpenChange ||
		state.isOpen !== isOpen ||
		state.id !== id
	) {
		store.setState((prev) => {
			prev.setIsOpen(isOpen);

			return {
				id,
				onOpenChange,
			};
		});
	}

	return null;
}

export const NativePopover = memo(function NativePopover({
	isOpen = false,
	children,
	id,
	onOpenChange,
}: React.PropsWithChildren<{
	isOpen?: boolean;
	id?: string;
	onOpenChange?: (open: boolean) => void;
}>) {
	const generatedId = useId();
	const actualId = id || generatedId;

	return (
		<NativePopoverContextProvider>
			<SyncNativePopoverValues
				onOpenChange={onOpenChange ?? noop}
				isOpen={isOpen}
				id={actualId}
			/>

			{children}
		</NativePopoverContextProvider>
	);
});

export const NativePopoverTrigger = memo(function NativePopoverTrigger({
	children,
	onClick,
	...props
}: React.PropsWithChildren<React.ComponentProps<"button">>) {
	const store = useStore();
	const buttonStyles = store.use.buttonStyles();
	const setIsOpen = store.use.setIsOpen();
	const isOpen = store.use.isOpen();
	const id = store.use.id();

	const style = useMemo(
		() => ({
			...props.style,
			...buttonStyles,
		}),
		[props.style, buttonStyles],
	);

	return (
		<button
			type="button"
			{...props}
			data-is-open={isOpen}
			popoverTarget={id}
			style={style}
			onClick={(e) => {
				onClick?.(e);

				// Toggle state; native popoverTarget handles the DOM,
				// but we sync state for conditional rendering.
				setIsOpen((prev) => !prev);
			}}
		>
			{children}
		</button>
	);
});

export const NativePopoverAnchor = memo(function NativePopoverAnchor({
	children,
	...props
}: React.PropsWithChildren<React.ComponentProps<"div">>) {
	const store = useStore();
	const buttonStyles = store.use.buttonStyles();

	const style = useMemo(
		() => ({
			...props.style,
			...buttonStyles,
		}),
		[props.style, buttonStyles],
	);

	return (
		<div {...props} style={style} data-popover-anchor>
			{children}
		</div>
	);
});

export const NativePopoverContent = memo(function NativePopoverContent({
	className,
	children,
	position,
	...props
}: React.PropsWithChildren<
	React.ComponentProps<"div"> & {
		position?: React.CSSProperties["positionArea"];
	}
>) {
	const store = useStore();
	const contentStyles = store.use.contentStyles();
	const onRendered = store.use.onRendered();
	const onToggle = store.use.onToggle();
	const id = store.use.id();

	const style = useMemo(
		() => ({
			...props.style,
			...contentStyles,
		}),
		[props.style, contentStyles],
	);

	return (
		<div
			{...props}
			data-popover-position={position}
			onToggle={onToggle}
			ref={onRendered}
			popover="auto"
			style={style}
			id={id}
			className={cn(
				"absolute flex-col hidden open:flex shadow-2xl border border-border-smooth rounded-lg p-1 simple-scrollbar gap-1 bg-popover text-primary [position-area:attr(data-popover-position_type(*),bottom)]",
				className,
			)}
		>
			{children}
		</div>
	);
});

export function NativePopoverClose({
	children,
	...props
}: React.PropsWithChildren<React.ComponentProps<"button">>) {
	const store = useStore();
	const setIsOpen = store.use.setIsOpen();

	return (
		<button
			type="button"
			className="flex items-center justify-center p-1 button-hover rounded-full"
			{...props}
			onClick={(e) => {
				props.onClick?.(e);
				setIsOpen(false);
			}}
		>
			{children ?? <X className="text-primary stroke-1 size-3.5" />}
		</button>
	);
}
