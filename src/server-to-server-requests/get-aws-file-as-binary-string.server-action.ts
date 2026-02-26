import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { AwsBucket, AwsKey } from "#/types/general";

export async function getAwsFileAsStringBinaryAction({
	region = "us-west-1",
	awsBucket,
	awsKey,
}: {
	awsBucket: AwsBucket;
	region?: string;
	awsKey: AwsKey;
}) {
	// On Vercel, using React Router, process.env is always empty, it seems.
	// But if we put the env var, we don't need to pass it as a prop.

	// 	console.log("getAwsFileAsStringBinaryAction", { env: process.env });
	//
	// 	const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
	// 	const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
	//
	// 	if (!AWS_SECRET_ACCESS_KEY || !AWS_ACCESS_KEY_ID) {
	// 		throw new Error("AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID not found!");
	// 	}

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
			const bytes = await getObjectResponse.Body.transformToByteArray();
			const imageString = Buffer.from(bytes).toString("base64");

			return new Response(imageString, {
				headers: {
					"Content-Type": "text/plain",
				},
				status: 200,
			});
		} else {
			throw new Response("No file found.", { status: 204 });
		}
	} catch (error) {
		console.error("Error in getAwsFileAsStringBinaryAction", error);

		throw Response.json(error, {
			headers: {
				"Content-Type": "application/json",
			},
			status: 500,
		});
	}
}
