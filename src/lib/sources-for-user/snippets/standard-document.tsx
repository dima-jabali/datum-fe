import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense, startTransition, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AwsImage } from "#/components/aws-image";
import { DownloadAndShowFilePreview } from "#/components/download-and-show-file-preview";
import {
	FallbackLoader,
	LoadError,
} from "#/components/default-suspense-and-error-boundary";
import {
	DOCUMENT_TYPES,
	SourceForUserType,
	StandardDocumentContentType,
	type StandardDocumentSourceType,
} from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";
import { DocumentSource, type GeneralFileType } from "#/types/file";
import { FileMetadataTable } from "#/lib/sources-for-user/file-metadata-table";

type MinimalProps = {
	normalizedSource: Extract<
		NormalizedSource,
		{
			source_type: SourceForUserType.StandardDocument;
			values_type: StandardDocumentSourceType.Minimal;
		}
	>;
};

type VerboseProps = {
	normalizedSource: Extract<
		NormalizedSource,
		{
			source_type: SourceForUserType.StandardDocument;
			values_type: StandardDocumentSourceType.Verbose;
		}
	>;
};

export function StandardDocumentMinimalDetails({
	normalizedSource: {
		values: {
			fields: {
				document_source,
				long_text_data,
				document_type,
				page_number,
				id,
			},
		},
	},
}: MinimalProps) {
	const [isOpen, setIsOpen] = useState(false);

	const shouldHaveFilePreview =
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		!DOCUMENT_TYPES.includes(document_type as any) &&
		document_source !== DocumentSource.Clickup;

	return (
		<details
			onToggle={(e) => {
				setIsOpen((e.target as HTMLDetailsElement).open);
			}}
			className="open:[&_summary]:max-h-full group"
		>
			<summary className="cursor-pointer max-h-[4lh] overflow-hidden text-xs">
				<span className="group-open:hidden">{long_text_data?.[0] || ""}</span>
			</summary>

			<div className="flex flex-col gap-2 w-full h-full text-xs">
				{isOpen ? (
					<>
						{shouldHaveFilePreview ? (
							<DownloadAndShowFilePreview
								className="max-h-[500px] w-full max-w-full overflow-auto"
								fileType={document_type as GeneralFileType}
								initialPage={page_number}
								fileStringId={id}
								fileId={NaN}
							/>
						) : null}

						{long_text_data?.join("") || ""}
					</>
				) : null}
			</div>
		</details>
	);
}

export function StandardDocumentVerboseDetails({
	normalizedSource: {
		values: { content_list, file_name, metadata },
	},
}: VerboseProps) {
	const [canFetchImage, setCanFetchImage] = useState(false);

	function fetchAwsImage() {
		startTransition(() => {
			setCanFetchImage(true);
		});
	}

	return (
		<details>
			<summary
				className="text-xs cursor-pointer my-1 group"
				title="More info about this source"
				onClick={fetchAwsImage}
			>
				<span className="group-hover:underline underline-offset-2">
					More info
				</span>

				{metadata ? <FileMetadataTable metadata={metadata} /> : null}
			</summary>

			<div className="flex flex-col gap-2 w-full max-w-full mt-3 whitespace-pre-wrap">
				{content_list?.map(function (item, index) {
					const key = `${file_name}${index}`;

					switch (item.type) {
						case StandardDocumentContentType.Text: {
							if (
								item.text?.startsWith("START") ||
								item.text?.startsWith("END")
							) {
								return null;
							}

							return (
								<p className="inline" key={key}>
									{item.text ?? ""}
								</p>
							);
						}

						case StandardDocumentContentType.ImageUrl: {
							return (
								<Suspense
									fallback={
										<FallbackLoader
											className="w-full aspect-video flex items-center justify-center bg-white/10 rounded-lg"
											fallbackFor="Standard document AWS image"
											title="Loading image from AWS…"
										/>
									}
									key={key}
								>
									<QueryErrorResetBoundary key={key}>
										{({ reset }) => (
											<ErrorBoundary
												fallback={
													<LoadError
														className="text-primary text-sm bg-red-300/30 p-4 rounded-lg flex flex-col items-center justify-center gap-4 w-full aspect-video"
														fallbackFor="Standard document AWS image"
														failedText="Failed to fetch image!"
														key={key}
													/>
												}
												onReset={reset}
												key={key}
											>
												{canFetchImage && item.image_url ? (
													<AwsImage
														aws_bucket={item.image_url.aws_bucket}
														aws_key={item.image_url.aws_key}
														key={key}
													/>
												) : (
													<FallbackLoader
														className="w-full aspect-video flex items-center justify-center bg-white/10 rounded-lg"
														fallbackFor="Standard document AWS image"
														title="Loading image from AWS…"
													/>
												)}
											</ErrorBoundary>
										)}
									</QueryErrorResetBoundary>
								</Suspense>
							);
						}

						default: {
							console.log("Unknown verbose StandardDocumentContentType", {
								item,
							});

							return null;
						}
					}
				})}
			</div>
		</details>
	);
}
