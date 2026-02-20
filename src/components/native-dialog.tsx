import { memo, useId } from "react";
import { X } from "lucide-react";

import { createZustandProvider } from "#/contexts/create-zustand-provider";
import { cn, noop } from "#/lib/utils";

type NativeDialogContext = {
	isOpen: boolean;
	modal: boolean;
	id: string;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onRendered: (node: HTMLDialogElement | null) => void;
	onOpenChange: (newIsOpen: boolean) => void;
	handleNativeClose: () => void;
};

function getDialog(id: string) {
	return document.getElementById(id) as HTMLDialogElement | null;
}

const { Provider: NativeDialogContextProvider, useStore } =
	createZustandProvider<NativeDialogContext>(
		function (get, set) {
			return {
				isOpen: false,
				modal: true, // Defaults to modal (backdrop, blocks interaction)
				id: "",

				/**
				 * synchronized the React state with the DOM state when
				 * the dialog is closed via Escape key or form method="dialog"
				 */
				handleNativeClose() {
					const state = get();

					if (!state.isOpen) return;

					set({ isOpen: false });

					state.onOpenChange?.(false);
				},

				onRendered(ref: HTMLDialogElement | null) {
					const { isOpen, modal } = get();

					if (ref) {
						// Use RAF to ensure the DOM is ready, similar to the reference
						requestAnimationFrame(() => {
							// Prevent errors by checking current native state
							if (isOpen && !ref.open) {
								if (modal) {
									ref.showModal();
								} else {
									ref.show();
								}
							} else if (!isOpen && ref.open) {
								ref.close();
							}
						});
					}
				},

				onOpenChange: noop,

				setIsOpen(newIsOpen) {
					const state = get();

					const nextIsOpen =
						typeof newIsOpen === "function"
							? newIsOpen(state.isOpen)
							: newIsOpen;

					if (state.isOpen === nextIsOpen) return;

					set({ isOpen: nextIsOpen });

					const dialog = getDialog(state.id);
					if (dialog) {
						if (nextIsOpen) {
							// Check !dialog.open to prevent InvalidStateError
							if (!dialog.open) {
								if (state.modal) {
									dialog.showModal();
								} else {
									dialog.show();
								}
							}
						} else {
							// Check dialog.open to avoid redundant close calls (optional but cleaner)
							if (dialog.open) {
								dialog.close();
							}
						}
					}

					state.onOpenChange?.(nextIsOpen);
				},
			};
		},
		{
			name: "dialog-html",
		},
	);

/**
 * Synchronizes props to the Zustand store without useEffect.
 */
function StoreSync({
	isOpen,
	modal,
	id,
	onOpenChange,
}: {
	onOpenChange: (open: boolean) => void;
	isOpen: boolean;
	modal: boolean;
	id: string;
}) {
	const store = useStore();
	const state = store.getState();

	if (
		state.onOpenChange !== onOpenChange ||
		state.isOpen !== isOpen ||
		state.modal !== modal ||
		state.id !== id
	) {
		store.setState({
			isOpen,
			modal,
			id,
			onOpenChange,
		});
	}

	return null;
}

export const NativeDialog = memo(function NativeDialog({
	isOpen = false,
	modal = true,
	children,
	id,
	onOpenChange,
}: React.PropsWithChildren<{
	isOpen?: boolean;
	modal?: boolean;
	id?: string;
	onOpenChange?: (open: boolean) => void;
}>) {
	const generatedId = useId();
	const actualId = id || generatedId;

	return (
		<NativeDialogContextProvider>
			<StoreSync
				onOpenChange={onOpenChange ?? noop}
				isOpen={isOpen}
				modal={modal}
				id={actualId}
			/>
			{children}
		</NativeDialogContextProvider>
	);
});

export const NativeDialogTrigger = memo(function NativeDialogTrigger({
	children,
	onClick,
	...props
}: React.PropsWithChildren<React.ComponentProps<"button">>) {
	const store = useStore();
	const setIsOpen = store.use.setIsOpen();
	const isOpen = store.use.isOpen();
	const id = store.use.id();

	return (
		<button
			type="button"
			{...props}
			aria-expanded={isOpen}
			aria-haspopup="dialog"
			data-is-open={isOpen}
			aria-controls={id}
			onClick={(e) => {
				onClick?.(e);

				setIsOpen((prev) => !prev);
			}}
		>
			{children}
		</button>
	);
});

export const NativeDialogContent = memo(function NativeDialogContent({
	className,
	children,
	onCancel,
	onClose,
	...props
}: React.PropsWithChildren<React.ComponentProps<"dialog">>) {
	const store = useStore();
	const handleNativeClose = store.use.handleNativeClose();
	const onRendered = store.use.onRendered();
	const id = store.use.id();

	return (
		<dialog
			closedby="any"
			{...props}
			ref={onRendered}
			id={id}
			onClose={(e) => {
				onClose?.(e);
				handleNativeClose();
			}}
			onCancel={(e) => {
				onCancel?.(e);
				// Note: Cancel fires on Esc, which then triggers Close.
				// We don't need to manually set state here as onClose handles it,
				// but exposing the event is useful for preventingDefault.
			}}
			className={cn(
				"open:flex hidden group relative backdrop:bg-black/50 bg-popover backdrop:backdrop-blur-sm shadow-2xl border border-border-smooth rounded-lg flex-col gap-4 p-6 mobile:p-3 bg sm:max-w-lg mobile:w-dvw max-w-dvw mobile:rounded-none mobile:shadow-none mobile:h-dvh mobile:max-w-dvw mobile:max-h-dvh max-h-[90dvh] mobile:border-none simple-scrollbar self-center justify-self-center text-primary",
				className,
			)}
		>
			{children}

			<NativeDialogClose />
		</dialog>
	);
});

/**
 * Helper to close the dialog from within via a button
 */
export const NativeDialogClose = memo(function NativeDialogClose({
	className,
	children,
	onClick,
	...props
}: React.PropsWithChildren<React.ComponentProps<"button">>) {
	const store = useStore();
	const setIsOpen = store.use.setIsOpen();

	return (
		<button
			type="button"
			{...props}
			tabIndex={1}
			className={cn(
				"absolute top-1 right-1 button-hover rounded-full p-1",
				className,
			)}
			onClick={(e) => {
				onClick?.(e);
				setIsOpen(false);
			}}
		>
			{children ?? <X className="size-4 stroke-1 stroke-primary" />}
		</button>
	);
});

export function NativeDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			data-slot="dialog-header"
			{...props}
		/>
	);
}

export function NativeDialogFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

export function NativeDialogTitle({
	className,
	...props
}: React.ComponentProps<"h2">) {
	return (
		<h2
			className={cn("text-lg leading-none font-semibold", className)}
			data-slot="dialog-title"
			{...props}
		/>
	);
}

export function NativeDialogDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}
