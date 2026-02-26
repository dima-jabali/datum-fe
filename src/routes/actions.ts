import { invariant } from "es-toolkit";

import { deleteAwsFile } from "#/server-to-server-requests/delete-aws-file.server-action";
import { getAwsBase64File } from "#/server-to-server-requests/get-aws-base64-file.server-action";
import { getAwsFileAsStringBinaryAction } from "#/server-to-server-requests/get-aws-file-as-binary-string.server-action";
import { getPresignedUrlAction } from "#/server-to-server-requests/get-presigned-url.server-action";
import { uploadFileAsBase64ToAws } from "#/server-to-server-requests/upload-file-as-base64-to-aws.server-action";
import type { Route } from "../+types/root";
import { uploadFileToAws } from "#/server-to-server-requests/upload-file-to-aws.server-action";
import {
	DELETE_AWS_FILE_ACTION,
	GET_AWS_BASE64_FILE_ACTION,
	GET_AWS_FILE_AS_STRING_BINARY_ACTION,
	GET_PRESIGNED_URL,
	isDev,
	UPLOAD_FILE_STRING_TO_AWS_ACTION,
	UPLOAD_FILE_TO_AWS,
} from "#/lib/utils";
import type { AwsBucket, AwsKey, Base64File } from "#/types/general";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const formId = formData.get("formId");

	const url = new URL(request.url);
	const formIdFromUrl = url.searchParams.get("form-id");

	if (isDev) {
		console.log("Catchall action", {
			formIdFromUrl,
			formData,
			request,
			formId,
		});
	}

	try {
		switch (formId || formIdFromUrl) {
			case GET_AWS_FILE_AS_STRING_BINARY_ACTION: {
				const fileMimeType = formData.get("fileMimeType") as string;

				invariant(fileMimeType, "Missing fileMimeType");

				const stringBinaryData = await getAwsFileAsStringBinaryAction({
					awsBucket: formData.get("aws_bucket") as AwsBucket,
					awsKey: formData.get("aws_key") as AwsKey,
				});

				const fileAsBase64String = `data:${fileMimeType};base64,${await stringBinaryData.text()}`;

				return fileAsBase64String;
			}

			case GET_AWS_BASE64_FILE_ACTION: {
				const stringBinaryData = await getAwsBase64File({
					awsBucket: formData.get("aws_bucket") as AwsBucket,
					awsKey: formData.get("aws_key") as AwsKey,
				});

				return (await stringBinaryData.text()) as Base64File;
			}

			case UPLOAD_FILE_STRING_TO_AWS_ACTION: {
				const fileMimeType = formData.get("fileMimeType") as string;

				invariant(fileMimeType, "Missing fileMimeType");

				const fileAsBase64String = formData.get("fileAsBase64String") as string;

				const response = await uploadFileAsBase64ToAws({
					awsBucket: formData.get("aws_bucket") as AwsBucket,
					awsKey: formData.get("aws_key") as AwsKey,
					fileAsBase64String,
					fileMimeType,
				});

				return response;
			}

			case UPLOAD_FILE_TO_AWS: {
				// IMPORTANT: request.body is a web stream.
				// AWS SDK v3 can consume this directly in most Node environments.
				const file = formData.get("file") as File;

				if (!file) throw new Error("No file stream");

				const response = await uploadFileToAws({
					awsBucket: url.searchParams.get("aws-bucket") as AwsBucket,
					awsKey: url.searchParams.get("aws-key") as AwsKey,
					fileMimeType: file.type,
					file: file,
				});

				return response;
			}

			case GET_PRESIGNED_URL: {
				const fileMimeType = formData.get("fileMimeType") as string;

				invariant(fileMimeType, "Missing fileMimeType");

				const url = await getPresignedUrlAction({
					awsBucket: formData.get("aws_bucket") as AwsBucket,
					awsKey: formData.get("aws_key") as AwsKey,
					fileMimeType,
				});

				return url;
			}

			case DELETE_AWS_FILE_ACTION: {
				return await deleteAwsFile({
					awsBucket: formData.get("aws_bucket") as AwsBucket,
					awsKey: formData.get("aws_key") as AwsKey,
				});
			}

			default: {
				console.error("Unknown formId:", formId);

				return {
					error: "Unknown formId",
				};
			}
		}
	} catch (error) {
		console.error("Error in catchall action:", error);

		return { error: "Error in catchall action", status: 500 };
	}
}
