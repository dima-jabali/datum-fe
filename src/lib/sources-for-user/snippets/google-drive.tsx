import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense, startTransition, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AwsImage } from "#/components/aws-image";
import {
	FallbackLoader,
	LoadError,
} from "#/components/default-suspense-and-error-boundary";
import {
	GoogleDriveContentType,
	SourceForUserType,
	type GoogleDriveSourceType,
} from "#/types/chat";
import { FileMetadataTable } from "#/lib/sources-for-user/file-metadata-table";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";

type MinimalProps = {
	normalizedSource: Extract<
		NormalizedSource,
		{
			source_type: SourceForUserType.GoogleDrive;
			values_type: GoogleDriveSourceType.Minimal;
		}
	>;
};

type VerboseProps = {
	normalizedSource: Extract<
		NormalizedSource,
		{
			source_type: SourceForUserType.GoogleDrive;
			values_type: GoogleDriveSourceType.Verbose;
		}
	>;
};

export function GoogleDriveMinimalDetails({
	normalizedSource: {
		values: {
			fields: { long_text_data },
		},
	},
}: MinimalProps) {
	return (
		<details className="open:[&_summary]:max-h-full">
			<summary className="cursor-pointer max-h-[4lh] overflow-hidden">
				{long_text_data?.[0] || ""}
			</summary>

			<p>{long_text_data?.slice(1).join("") || ""}</p>
		</details>
	);
}

export function GoogleDriveVerboseDetails({
	normalizedSource: {
		values: { content_list, file_name, metadata },
	},
}: VerboseProps) {
	const [canFetchImage, setCanFetchImage] = useState(false);

	const title = `${file_name ?? ""}`;
	const contentList = content_list;

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

			<div className="flex flex-col gap-2 w-full max-w-full mt-3 text-xs">
				{contentList.map(function (item, index) {
					const key = `${title}${index}`;

					switch (item.type) {
						case GoogleDriveContentType.Text: {
							return <p key={key}>{item.text}</p>;
						}

						case GoogleDriveContentType.ImageUrl: {
							return (
								<Suspense
									fallback={
										<FallbackLoader
											className="w-full aspect-video flex items-center justify-center bg-white/10 rounded-lg"
											fallbackFor="Google Drive AWS image"
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
														fallbackFor="Google Drive AWS image"
														failedText="Failed to fetch image!"
														key={key}
													/>
												}
												onReset={reset}
												key={key}
											>
												{canFetchImage ? (
													<AwsImage
														aws_bucket={item.image_url.aws_bucket}
														aws_key={item.image_url.aws_key}
														key={key}
													/>
												) : (
													<FallbackLoader
														className="w-full aspect-video flex items-center justify-center bg-white/10 rounded-lg"
														fallbackFor="Google Drive AWS image"
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
							console.log("Unknown verbose GoogleDriveContentType", {
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
