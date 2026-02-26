import { cn } from "#/lib/utils";

export function NativePdfViewer({
	fileBlobUrl,
	className,
}: {
	className?: string | undefined;
	fileBlobUrl: string;
}) {
	return fileBlobUrl ? (
		<object
			onLoad={() => {
				console.log("Native PDF loaded successfully:", fileBlobUrl);
			}}
			onError={(error) => {
				console.error("Error loading native PDF", { error, fileBlobUrl });
			}}
			className={cn("flex h-full w-full rounded-md min-h-[50dvh]", className)}
			type="application/pdf"
			data={fileBlobUrl}
			data-no-print
		>
			Your browser does not support displaying PDFs.
		</object>
	) : null;
}
