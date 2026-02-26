import { memo, useEffect } from "react";

import { generalCtx } from "#/contexts/general/ctx";
import { useIsStreaming } from "#/hooks/get/use-get-bot-conversation";

export const AutoScrollIfOnBottom = memo(function AutoScrollIfOnBottom() {
	const scrollContainer = generalCtx.use.chatListRef();
	const isStreaming = useIsStreaming();

	useEffect(() => {
		if (!isStreaming || !scrollContainer) return;

		let shouldScrollToBottom = true;

		const handleScroll = () => {
			const isCloseToBottom =
				Math.abs(
					scrollContainer.scrollHeight -
						scrollContainer.clientHeight -
						scrollContainer.scrollTop,
				) <= 25;

			shouldScrollToBottom = isCloseToBottom;
		};

		let animationFrameId: number | null = null;

		const domMutationObserver = new MutationObserver(() => {
			if (shouldScrollToBottom) {
				// Cancel any pending scroll to avoid multiple requests
				if (animationFrameId !== null) {
					cancelAnimationFrame(animationFrameId);
				}

				// Defer the scroll operation to the next animation frame
				animationFrameId = requestAnimationFrame(() => {
					scrollContainer.scrollTop = scrollContainer.scrollHeight;
					animationFrameId = null; // Reset the ID
				});
			}
		});

		// Configure the MutationObserver to observe child list changes
		// Start observing the target node for configured mutations
		domMutationObserver.observe(scrollContainer, {
			characterData: true,
			childList: true,
			subtree: true,
		});

		scrollContainer.addEventListener("scroll", handleScroll, {
			passive: true,
		});

		return () => {
			scrollContainer.removeEventListener("scroll", handleScroll);
			domMutationObserver.disconnect();

			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [isStreaming, scrollContainer]);

	return null;
});
