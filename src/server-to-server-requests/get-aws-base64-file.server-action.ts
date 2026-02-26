import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { AwsBucket, AwsKey } from "#/types/general";

export async function getAwsBase64File({
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

		const getObjectResponse = await s3.send(
			new GetObjectCommand({
				Bucket: awsBucket,
				Key: awsKey,
			}),
		);

		if (getObjectResponse.Body) {
			const base64String = await getObjectResponse.Body.transformToString();

			return new Response(base64String, {
				headers: {
					"Content-Type": "text/plain",
				},
				status: 200,
			});
		} else {
			throw new Response("No base64 file found.", { status: 204 });
		}
	} catch (error) {
		console.error("Error in getAwsBase64File", error);

		throw Response.json(error, {
			headers: {
				"Content-Type": "application/json",
			},
			status: 500,
		});
	}
}
