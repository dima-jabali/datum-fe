import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { PdfId } from "#/types/notebook";
import type { GeneralFileType } from "#/types/file";
import { isValidNumber } from "#/lib/utils";
import { queryKeyFactory } from "#/hooks/query-key-factory";

export type GetPresignedUrlByFileIdResponse = {
	type: GeneralFileType.PDF;
	file_size_bytes: number;
	presigned_url: string;
	description: string;
	file_name: string;
	indexed: boolean;
	summary: string;
	title: string;
	uuid: string;
	id: PdfId;
};

export function useFetchPdfFileById(
	enabled: boolean,
	pdfFileId?: PdfId | PdfId,
) {
	const canFetch = enabled && isValidNumber(pdfFileId);

	const queryOptions = useMemo(
		() => queryKeyFactory.get["pdf-file-by-id"](pdfFileId),
		[pdfFileId],
	);

	return useQuery({
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		staleTime: Infinity, // never stale
		enabled: canFetch,
		gcTime: Infinity, // never gc
		...queryOptions,
	});
}
