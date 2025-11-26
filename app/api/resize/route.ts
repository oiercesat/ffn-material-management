// app/api/resize/route.ts
import { NextResponse } from "next/server";
import AWS from "aws-sdk";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const lambda = new AWS.Lambda({
        region: "us-east-1",
        endpoint: process.env.LAMBDA_ENDPOINT || "http://localhost:4566",
        accessKeyId: "test",
        secretAccessKey: "test",
        });

        const result = await lambda.invoke({
        FunctionName: "resizeImage",
        Payload: JSON.stringify(body),
        }).promise();

        const payload = result.Payload
        ? JSON.parse(result.Payload as string)
        : null;

        return NextResponse.json(payload || { error: "No payload" });
    } catch (err: any) {
        console.error("❌ API error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
