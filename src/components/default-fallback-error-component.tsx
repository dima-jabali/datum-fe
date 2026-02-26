import type { FallbackProps } from "react-error-boundary";

export function DefaultFallbackErrorComponent({ error }: FallbackProps) {
	return (
		<div className="flex h-full w-full flex-col gap-8 p-6" role="alert">
			<p className="text-center text-base font-bold text-red-300">
				Something went wrong:
			</p>

			<p className="text-wrap text-center text-red-300">
				{typeof error === "object" &&
				error !== null &&
				"message" in error &&
				typeof error.message === "string"
					? error.message
					: ""}
			</p>
		</div>
	);
}
