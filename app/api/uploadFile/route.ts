import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3/s3Client";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: file.name,
    Body: buffer,
    ContentType: file.type,
  });

  await s3.send(command);

  const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${encodeURIComponent(file.name)}`;

  return NextResponse.json({ url: fileUrl });
}