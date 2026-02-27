import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { invariant } from "es-toolkit";
import { getErrorMessage } from "react-error-boundary";
import { toast } from "sonner";

import { clientAPI_V1 } from "#/api/axios";
import {
	GET_AWS_FILE_AS_STRING_BINARY_ACTION,
	isValidNumber,
} from "#/lib/utils";
import {
	DocumentSource,
	GeneralFileType,
	type GeneralFile,
} from "#/types/file";
import type { AwsBucket, AwsKey, PageLimit, PageOffset } from "#/types/general";
import { queryKeyFactory } from "#/hooks/query-key-factory";

type GetGeneralFilesPageResponse = {
	results: Array<GeneralFile>;
	num_results: number;
	offset: PageOffset;
	limit: PageLimit;
};

export type FetchFileByIdProps = {
	aws_bucket?: AwsBucket | null | undefined;
	aws_key?: AwsKey | null | undefined;
	fileStringId?: string | undefined;
	organizationId: number | null;
	fileType: LocalMimeType;
	fileId: number;
};

export async function queryFnToFetchFileById({
	organizationId,
	fileStringId,
	aws_bucket,
	fileType,
	aws_key,
	fileId,
}: FetchFileByIdProps) {
	try {
		const hasValidFileId = isValidNumber(fileId);

		if (!hasValidFileId && !fileStringId && !aws_bucket && !aws_key) {
			throw new Error("No valid file ID provided.", {
				cause: `File ID: \`${fileId}\`; File string id: \`${fileStringId}\``,
			});
		}

		async function tryAws(aws_bucket: AwsBucket, aws_key: AwsKey) {
			const formData = new FormData();
			formData.set("formId", GET_AWS_FILE_AS_STRING_BINARY_ACTION);
			formData.set("fileMimeType", fileType);
			formData.set("aws_bucket", aws_bucket);
			formData.set("aws_key", aws_key);

			const res = await fetch("/actions", {
				body: formData,
				method: "POST",
			});

			const dataAsString = await res.text();

			invariant(dataAsString, "No dataAsString!");

			const blob = await fetch(dataAsString).then((res) => res.blob());

			return blob;
		}

		if (aws_bucket && aws_key) {
			return await tryAws(aws_bucket, aws_key);
		}

		if (hasValidFileId) {
			const generalFileResponse = await clientAPI_V1.get<GeneralFile>(
				`/files/${fileId}`,
			);

			if (generalFileResponse.status !== 200) {
				throw new Error("Failed to fetch presigned URL.");
			}

			const presigned_url = generalFileResponse.data.presigned_url;

			if (
				generalFileResponse.data.document_source === DocumentSource.GOOGLE_DRIVE
			) {
				throw new Error(
					"Google Drive files cannot be downloaded, only opened in a new tab!",
				);
			}

			if (presigned_url) {
				const fileResponse = await axios.get(presigned_url, {
					responseType: "arraybuffer",
				});

				if (fileResponse.status !== 200) {
					throw new Error("Failed to fetch file from presigned URL");
				}

				const blob = new Blob([fileResponse.data], {
					type: matchGeneralFileTypeToMimeType(fileType),
				});

				return blob;
			} else {
				const { aws_bucket, aws_key } = generalFileResponse.data;

				if (aws_bucket && aws_key) {
					return await tryAws(aws_bucket, aws_key);
				}

				throw new Error("Failed to fetch presigned URL or from AWS.");
			}
		} else {
			if (!hasValidFileId && !isValidNumber(organizationId)) {
				throw new Error("No valid organization ID provided.", {
					cause: `Organization ID: \`${organizationId}\` and no file id provided, file string id: \`${fileStringId}\``,
				});
			}

			const generalFilesPageResponse =
				await clientAPI_V1.get<GetGeneralFilesPageResponse>(
					`/organizations/${organizationId}/files?vespa_source_id=${fileStringId}`,
				);

			if (generalFilesPageResponse.status !== 200) {
				throw new Error("Failed to fetch presigned URL.");
			}

			const firstResult = generalFilesPageResponse.data.results[0];

			if (!firstResult) {
				throw new Error("No files found.");
			}

			if (firstResult.document_source === DocumentSource.GOOGLE_DRIVE) {
				throw new Error(
					"Google Drive files cannot be downloaded, only opened in a new tab!",
				);
			}

			const { aws_bucket, aws_key } = firstResult;

			if (aws_bucket && aws_key) {
				return await tryAws(aws_bucket, aws_key);
			}

			throw new Error("Failed to fetch from AWS. No aws params provided.");
		}
	} catch (error) {
		console.log("Error fetching file by presigned URL:", error);

		toast.error("Error fetching file", {
			description: getErrorMessage(error),
		});

		throw error;
	}
}

export function useGetFileById(
	props: Omit<FetchFileByIdProps, "submitActionPromise">,
) {
	return useQuery({
		queryKey: [...queryKeyFactory.get["file-by-presigned-url"].queryKey, props],
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		staleTime: Infinity, // never stale
		gcTime: Infinity, // never gc
		queryFn: async () => await queryFnToFetchFileById(props),
	});
}

export enum LocalMimeType {
	Xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	Pptx = "application/vnd.ms-powerpoint",
	General = "application/octet-stream",
	Docx = "application/msword",
	Pdf = "application/pdf",
	Csv = "text/csv",
	Image = "image/",
}

export function matchGeneralFileTypeToMimeType(fileType: string) {
	switch (fileType) {
		case GeneralFileType.CSV:
		case LocalMimeType.Csv:
		case "csv":
			return LocalMimeType.Csv;

		case GeneralFileType.DOCX:
		case LocalMimeType.Docx:
		case "docx":
			return LocalMimeType.Docx;

		case GeneralFileType.PDF:
		case LocalMimeType.Pdf:
		case "pdf":
			return LocalMimeType.Pdf;

		case GeneralFileType.PPTX:
		case LocalMimeType.Pptx:
		case "pptx":
			return LocalMimeType.Pptx;

		case GeneralFileType.JPEG:
		case "jpeg":
		case GeneralFileType.TIFF:
		case "tiff":
		case GeneralFileType.HEIF:
		case "heif":
		case GeneralFileType.HEIC:
		case "heic":
		case GeneralFileType.PNG:
		case "png":
		case GeneralFileType.IMAGE:
		case LocalMimeType.Image:
		case "image":
			return LocalMimeType.Image;

		case GeneralFileType.GENERAL:
		case LocalMimeType.General:
		case "general":
			return LocalMimeType.General;

		case GeneralFileType.XLSX:
		case LocalMimeType.Xlsx:
		case "xlsx":
			return LocalMimeType.Xlsx;

		default:
			throw new Error(`Unsupported file type! "${fileType}"`);
	}
}

export function matchMimeTypeToGeneralFileTypes(fileType: string) {
	if (fileType.startsWith(LocalMimeType.Image)) {
		switch (fileType.slice(LocalMimeType.Image.length)) {
			case "tiff":
				return GeneralFileType.TIFF;

			case "heif":
				return GeneralFileType.HEIF;

			case "heic":
				return GeneralFileType.HEIC;

			case "png":
				return GeneralFileType.PNG;

			case "jpeg":
			case "jpg":
				return GeneralFileType.JPEG;

			default:
				break;
		}
	}

	switch (fileType) {
		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		case LocalMimeType.Docx:
			return GeneralFileType.DOCX;

		case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
		case LocalMimeType.Pptx:
			return GeneralFileType.PPTX;

		case LocalMimeType.Csv:
			return GeneralFileType.CSV;

		case LocalMimeType.Xlsx:
			return GeneralFileType.XLSX;

		case LocalMimeType.Pdf:
			return GeneralFileType.PDF;

		default:
			throw new Error(`Unsupported file type! "${fileType}"`);
	}
}
