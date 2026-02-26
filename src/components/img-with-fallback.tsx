import { useState } from "react";

export function ImgWithFallback({
	fallbackNode,
	fallbackSrc,
	src,
	...rest
}: React.ComponentProps<"img"> & {
	fallbackNode?: React.ReactNode;
	fallbackSrc?: string;
}) {
	const [hasError, setHasError] = useState(false);

	const imgSrc = hasError || !src ? fallbackSrc : src;

	function handleError() {
		setHasError(true);
	}

	return imgSrc === undefined ? (
		fallbackNode
	) : (
		<img src={imgSrc} {...rest} onError={handleError} />
	);
}
