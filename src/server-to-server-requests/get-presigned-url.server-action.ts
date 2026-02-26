import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getPresignedUrlAction({
	fileMimeType,
	awsBucket,
	awsKey,
}: {
	fileMimeType: string;
	awsBucket: string;
	awsKey: string;
}) {
	const client = new S3Client({ region: "us-west-1" });

	const command = new PutObjectCommand({
		ContentType: fileMimeType,
		Bucket: awsBucket,
		Key: awsKey,
	});

	// URL valid for 3600 seconds (1 hour)
	const url = await getSignedUrl(client, command, { expiresIn: 3600 });

	return url;
}
