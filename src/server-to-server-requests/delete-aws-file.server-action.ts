import {
	DeleteObjectCommand,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3";

import type { AwsBucket, AwsKey } from "#/types/general";

export const config = {
	api: {
		bodyParser: false, // Disable default Next.js body parser
	},
};

export async function deleteAwsFile({
	region = "us-west-1",
	awsBucket,
	awsKey,
}: {
	awsBucket: AwsBucket;
	region?: string;
	awsKey: AwsKey;
}) {
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
			new DeleteObjectCommand({
				Bucket: awsBucket,
				Key: awsKey,
			}),
		);

		return new Response("File deleted on AWS successfully", {
			headers: {
				"Content-Type": "text/plain",
			},
			status: 200,
		});
	} catch (error) {
		console.error("Failed to delete file on AWS", error);

		if (error instanceof S3ServiceException) {
			console.error(
				`Error from S3 while deleting object from awsBucket="${awsBucket}" and awsKey="${awsKey}".\n\n${error.name}: ${error.message}`,
			);
		}

		// Since you throw a Response.json for upload, we maintain consistency
		throw Response.json(error, {
			headers: {
				"Content-Type": "application/json",
			},
			status: 500,
		});
	}
}
