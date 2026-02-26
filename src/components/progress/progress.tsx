import { ProgressType } from "#/components/progress/utils";

type Props = {
	bytesParagraphRef: React.RefObject<HTMLParagraphElement | null>;
	progressRef: React.RefObject<HTMLProgressElement | null>;
	type: ProgressType;
};

// Styling with CSS. Spinner from https://uiverse.io/AqFox/young-dragon-29
const SPINNER = (
	<div className="spinner-progress">
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
	</div>
);

export function Progress({ type, bytesParagraphRef, progressRef }: Props) {
	return (
		<div
			className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border border-border-smooth  p-4"
			title="Upload in progress…"
		>
			{type === ProgressType.RunningWithoutProgress ? (
				SPINNER
			) : (
				<>
					<span className="text-sm" ref={bytesParagraphRef}></span>

					<progress
						className="w-2/3 rounded-full"
						ref={progressRef}
						aria-valuemin={0}
						max={100}
					/>
				</>
			)}
		</div>
	);
}
