import { memo, startTransition, Suspense, useEffect, useState } from "react";

import { CsvToHtmlTable } from "#/components/csv-to-html-table";
import {
	FallbackLoader,
	LoadError,
} from "#/components/default-suspense-and-error-boundary";
import { NativePdfViewer } from "#/components/native-pdf-viewer";
import type { AwsBucket, AwsKey } from "#/types/general";
import type { GeneralFileType } from "#/types/file";
import {
	LocalMimeType,
	matchGeneralFileTypeToMimeType,
	useGetFileById,
} from "#/hooks/get/use-get-file-by-id";
import { useWithOrganizationId } from "#/contexts/general/ctx";

type Props = {
	aws_bucket?: AwsBucket | null | undefined;
	fileType: GeneralFileType | LocalMimeType;
	fallbackClassName?: string | undefined;
	aws_key?: AwsKey | null | undefined;
	fileStringId?: string | undefined;
	initialPage?: number | undefined;
	className?: string | undefined;
	fileId: number;
};

export const DownloadAndShowFilePreview = memo(
	function DownloadAndShowFilePreview({
		fileStringId,
		initialPage,
		aws_bucket,
		className,
		fileType,
		aws_key,
		fileId,
	}: Props) {
		const mimeType = matchGeneralFileTypeToMimeType(fileType);

		const organizationId = useWithOrganizationId();
		const blobQuery = useGetFileById({
			fileType: mimeType,
			organizationId,
			fileStringId,
			aws_bucket,
			aws_key,
			fileId,
		});

		if (blobQuery.isPending) {
			return <FallbackLoader fallbackFor="DownloadAndShowFilePreview" />;
		}
		if (blobQuery.isError) {
			return (
				<LoadError
					failedText="Failed to load file preview!"
					fallbackFor="DownloadAndShowFilePreview"
					error={blobQuery.error}
				/>
			);
		}

		switch (mimeType) {
			case LocalMimeType.Csv:
				return <CsvPreview className={className} blob={blobQuery.data} />;

			case LocalMimeType.Pdf:
				return (
					<PdfPreview
						initialPage={initialPage}
						blob={blobQuery.data}
						className={className}
					/>
				);

			case LocalMimeType.Image:
				return <ImagePreview className={className} blob={blobQuery.data} />;

			default:
				return null;
		}
	},
);

function CsvPreview({
	className,
	blob,
}: {
	blob: Blob;
	className?: string | undefined;
}) {
	const [csvText, setCsvText] = useState("");

	useEffect(() => {
		startTransition(async () => {
			setCsvText(await blob.text());
		});
	}, [blob]);

	return (
		<Suspense fallback={<FallbackLoader fallbackFor="CsvPreview" />}>
			<CsvToHtmlTable className={className} csv={csvText} />
		</Suspense>
	);
}

function PdfPreview({
	className,
	blob,
}: {
	initialPage?: number | undefined;
	className?: string | undefined;
	blob: Blob;
}) {
	const [fileUrl, setFileUrl] = useState("");

	useEffect(() => {
		const blobFileUrl = URL.createObjectURL(blob);

		setFileUrl(blobFileUrl);

		return () => {
			URL.revokeObjectURL(blobFileUrl);
		};
	}, [blob]);

	return fileUrl ? (
		<NativePdfViewer fileBlobUrl={fileUrl} className={className} />
	) : null;
}

function ImagePreview({
	className,
	blob,
}: {
	className?: string | undefined;
	blob: Blob;
}) {
	const [imgSrc, setImgUrl] = useState("");

	useEffect(() => {
		const blobFileUrl = URL.createObjectURL(blob);

		setImgUrl(blobFileUrl);

		return () => {
			URL.revokeObjectURL(blobFileUrl);
		};
	}, [blob]);

	return imgSrc ? <img className={className} src={imgSrc} alt="" /> : null;
}
