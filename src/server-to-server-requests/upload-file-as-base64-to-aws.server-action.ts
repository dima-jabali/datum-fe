import {
	S3Client,
	PutObjectCommand,
	S3ServiceException,
} from "@aws-sdk/client-s3";

import type { AwsBucket, AwsKey } from "#/types/general";

export const config = {
	api: {
		bodyParser: false, // Disable default Next.js body parser
	},
};

export async function uploadFileAsBase64ToAws({
	region = "us-west-1",
	fileAsBase64String,
	fileMimeType,
	awsBucket,
	awsKey,
}: {
	fileAsBase64String: string;
	fileMimeType: string;
	awsBucket: AwsBucket;
	region?: string;
	awsKey: AwsKey;
}) {
	if (!fileAsBase64String) {
		throw new Response("`fileAsBase64String` is required.", {
			status: 403,
		});
	}

	if (
		!awsBucket ||
		!awsKey ||
		awsBucket === "undefined" ||
		awsBucket === "null" ||
		awsKey === "undefined" ||
		awsKey === "null"
	) {
		throw new Response(
			"`aws_bucket` and `aws_key` query params are required.",
			{
				status: 403,
			},
		);
	}

	try {
		const s3 = new S3Client({ region });

		await s3.send(
			new PutObjectCommand({
				ContentType: fileMimeType || "application/octet-stream",
				Body: fileAsBase64String,
				Bucket: awsBucket,
				Key: awsKey,
			}),
		);

		return new Response("File uploaded to AWS successfully", {
			headers: {
				"Content-Type": "text/plain",
			},
			status: 200,
		});
	} catch (error) {
		console.error("Failed to upload file to AWS", error);

		if (
			error instanceof S3ServiceException &&
			error.name === "EntityTooLarge"
		) {
			console.error(
				`Error from S3 while uploading object to ${awsBucket}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`,
			);
		} else if (error instanceof S3ServiceException) {
			console.error(
				`Error from S3 while uploading object to ${awsBucket}.\n\n${error.name}: ${error.message}`,
			);
		}

		throw Response.json(error, {
			headers: {
				"Content-Type": "application/json",
			},
			status: 500,
		});
	}
}
