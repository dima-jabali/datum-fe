import { useState } from "react";

import {
	NativeDialog,
	NativeDialogContent,
	NativeDialogTrigger,
} from "#/components/native-dialog";
import { NativePdfViewer } from "#/components/native-pdf-viewer";
import { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { useGetPdfFileById } from "#/hooks/get/use-get-pdf-file-by-id";
import { LOADER } from "#/components/loader";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.Pdf }
	>;
};

export function PdfTitlePopoverTrigger({
	normalizedSource: {
		values: { pdf_id },
	},
}: Props) {
	const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

	const fetchPdfFileByIdQuery = useGetPdfFileById(isPdfPreviewOpen, pdf_id);

	return (
		<NativeDialog onOpenChange={setIsPdfPreviewOpen} isOpen={isPdfPreviewOpen}>
			<NativeDialogTrigger
				className="max-h-full break-all text-left truncate group-data-[is-drawer]/drawer:font-bold group-data-[is-drawer]/drawer:text-base group-data-[is-drawer]/drawer:link hover:underline"
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				PDF file snippet
			</NativeDialogTrigger>

			{isPdfPreviewOpen ? (
				<NativeDialogContent className="p-0 rounded-lg items-center justify-center h-[90dvh] min-w-[50dvw] max-w-[90dvw] mobile:p-0 mobile:pt-6">
					{fetchPdfFileByIdQuery.isError ? (
						<span>Failed to fetch PDF file!</span>
					) : fetchPdfFileByIdQuery.isPending ? (
						LOADER
					) : fetchPdfFileByIdQuery.data ? (
						<div className="h-[calc(90dvh-2px)] mobile:h-[90dvh] w-full simple-scrollbar">
							<NativePdfViewer
								fileBlobUrl={fetchPdfFileByIdQuery.data.fileUrl}
							/>
						</div>
					) : null}
				</NativeDialogContent>
			) : null}
		</NativeDialog>
	);
}
