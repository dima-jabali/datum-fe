import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { memo, Suspense, useEffect, useRef, useState } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import { CsvToHtmlTable } from "#/components/csv-to-html-table";
import { Button } from "#/components/ui/button";

type CsvMarkdownBlockProps = {
	csv: string;
};

function CsvMarkdownBlock_({ csv = "" }: CsvMarkdownBlockProps) {
	const [isCsvComplete, setIsCsvComplete] = useState(false);

	const timerToConsiderCsvReceivedRef =
		useRef<ReturnType<typeof setTimeout>>(undefined);

	// If there has been some time that the `csv` text hasn't changed,
	// we can consider it received/complete and start parsing it.
	useEffect(() => {
		clearTimeout(timerToConsiderCsvReceivedRef.current);

		timerToConsiderCsvReceivedRef.current = setTimeout(() => {
			setIsCsvComplete(true);
		}, 1_000);
	}, [csv]);

	return isCsvComplete ? (
		<CsvToHtmlTable
			className="simple-scrollbar self-auto"
			withErrorBoundary={false}
			csv={csv}
		/>
	) : (
		<div className="flex gap-2 items-center">
			<Loader className="size-3.5" />

			<span className="inline-flex text-sm text-muted-foreground">
				Receiving CSV
			</span>
		</div>
	);
}

export const CsvMarkdownBlock = memo(function CsvMarkdownBlock(
	props: CsvMarkdownBlockProps,
) {
	const [prevCsv, setPrevCsv] = useState(props.csv);
	const [error, setError] = useState<Error>();

	return (
		<Suspense fallback={<FallbackLoader />}>
			<QueryErrorResetBoundary>
				{({ reset }) => (
					<ErrorBoundary
						onError={(error) => {
							setError(error as Error);
							setPrevCsv(props.csv);
						}}
						fallback={
							<LoadError
								csv={props.csv ?? ""}
								prevCsv={prevCsv}
								error={error}
							/>
						}
						onReset={reset}
					>
						<CsvMarkdownBlock_ {...props} />
					</ErrorBoundary>
				)}
			</QueryErrorResetBoundary>
		</Suspense>
	);
});

function FallbackLoader() {
	return (
		<div
			className="w-full h-full flex items-center justify-center"
			title="Loading…"
		>
			<Loader />
		</div>
	);
}

function LoadError({
	prevCsv,
	error,
	csv,
}: {
	error?: Error | undefined;
	prevCsv: string;
	csv: string;
}) {
	const { resetBoundary } = useErrorBoundary();

	const timerToTryAgainRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		clearTimeout(timerToTryAgainRef.current);

		if (csv === prevCsv) return;

		timerToTryAgainRef.current = setTimeout(() => {
			resetBoundary();
		}, 5_000);

		return () => clearTimeout(timerToTryAgainRef.current);
	}, [resetBoundary, error, prevCsv, csv]);

	return (
		<div className="text-primary text-sm relative before:inset-0 before:bg-white bg-red-300/30 p-4 flex flex-col items-center justify-center gap-6 w-full h-full">
			<span>Failed to parse CSV:</span>

			<pre className="text-xs italic font-mono">{csv}</pre>

			<details className="text-xs">
				<summary title="Open to see error stack">{error?.message}</summary>

				<div
					className="max-w-full simple-scrollbar rounded-md bg-destructive/30 p-4 flex flex-col gap-3"
					title="Error stack"
				>
					<pre className="whitespace-pre-wrap">{error?.stack}</pre>
				</div>
			</details>

			<Button onClick={resetBoundary} size="sm">
				Retry
			</Button>
		</div>
	);
}
