import { cn } from "#/lib/utils";

export function Loader({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				"aspect-square size-4 flex-none animate-spin rounded-full border-2 border-transparent border-t-primary duration-500",
				className,
			)}
		/>
	);
}

export const LOADER = <Loader />;
