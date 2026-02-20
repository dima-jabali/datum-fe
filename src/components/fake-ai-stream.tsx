import { memo, useEffect, useState, type ComponentProps } from "react";

type FakeAIStreamProps = {
	enabled?: boolean;
	fullText: string;
	speed?: number; // milliseconds per character
};

export const FakeAIStream = memo(function FakeAIStream({
	enabled = true,
	speed = 40,
	fullText,
	children,
	...props
}: React.PropsWithChildren<FakeAIStreamProps & ComponentProps<"p">>) {
	const [prevFullText, setPrevFullText] = useState(fullText);
	const [displayedText, setDisplayedText] = useState("");

	const shouldFakeStream =
		enabled && prevFullText !== fullText && displayedText !== fullText;

	useEffect(() => {
		if (!shouldFakeStream) {
			setDisplayedText(fullText);
			setPrevFullText(fullText);

			return;
		}

		let index = 0;

		const interval = setInterval(() => {
			if (index <= fullText.length) {
				const nextDisplayedText = fullText.slice(0, index);

				setDisplayedText(nextDisplayedText);

				++index;
			} else {
				setPrevFullText(fullText);
				clearInterval(interval);
			}
		}, speed);

		return () => clearInterval(interval); // cleanup if the component unmounts
	}, [fullText, shouldFakeStream, speed]);

	return (
		<span {...props}>
			{displayedText}

			{children}
		</span>
	);
});
