import { useState } from "react";

import { handleCopyTextToClipboard } from "#/lib/utils";
import { CHECK_ICON, CLIPBOARD_ICON, X_ICON } from "#/components/msg-icons";

export function CopyButton({ text }: { text: string }) {
	const [wasCopiedSuccessfully, setWasCopiedSuccessfully] = useState<boolean>();

	return (
		<button
			className="flex items-center gap-2 whitespace-nowrap text-primary rounded-sm py-1 px-2 button-hover"
			onClick={() => handleCopyTextToClipboard(text, setWasCopiedSuccessfully)}
			type="button"
		>
			{wasCopiedSuccessfully === true ? (
				<>
					{CHECK_ICON}

					<span>Copied</span>
				</>
			) : wasCopiedSuccessfully === false ? (
				<>
					{X_ICON}

					<span>Failed to copy</span>
				</>
			) : (
				<>
					{CLIPBOARD_ICON}

					<span>Copy</span>
				</>
			)}
		</button>
	);
}
