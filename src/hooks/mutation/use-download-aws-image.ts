import { useQuery } from "@tanstack/react-query";
import { invariant } from "es-toolkit";

import type { GoogleDriveVerboseSource } from "#/types/chat";
import type { Base64Image } from "#/types/general";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { GET_AWS_FILE_AS_STRING_BINARY_ACTION } from "#/lib/utils";

export type FetchAwsImageProps =
	GoogleDriveVerboseSource["content_list"][0]["image_url"];

export function useDownloadAwsImage({
	aws_bucket,
	aws_key,
}: FetchAwsImageProps) {
	return useQuery({
		staleTime: Infinity,

		queryKey: [
			...queryKeyFactory.get["aws-image"].queryKey,
			aws_bucket,
			aws_key,
		],

		async queryFn() {
			const imageType = aws_key.split(".").at(-1);

			if (!imageType) {
				throw new Error("Image type not found");
			}

			const formData = new FormData();
			formData.set("formId", GET_AWS_FILE_AS_STRING_BINARY_ACTION);
			formData.set("fileMimeType", imageType);
			formData.set("aws_bucket", aws_bucket);
			formData.set("aws_key", aws_key);

			const res = await fetch("/actions", {
				body: formData,
				method: "POST",
			});

			const img = await res.text();

			invariant(img, "No fileAsBase64String!");

			return img as Base64Image;
		},

		meta: {
			errorTitle: "Error downloading all conversations!",
		},
	});
}
