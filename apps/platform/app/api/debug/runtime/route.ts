import { NextResponse } from "next/server";

export const runtime = "nodejs";

function describeEnv(name: string) {
  const value = process.env[name];

  return {
    configured: Boolean(value),
    length: value?.length ?? 0,
  };
}

export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_RUNTIME_DEBUG !== "true") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    authSessionSecret: describeEnv("AUTH_SESSION_SECRET"),
    databaseUrl: describeEnv("DATABASE_URL"),
    s3AvatarBucket: describeEnv("S3_AVATAR_BUCKET"),
    s3AvatarRegion: describeEnv("S3_AVATAR_REGION"),
    s3AvatarPublicBaseUrl: describeEnv("S3_AVATAR_PUBLIC_BASE_URL"),
    s3AvatarAccessKeyId: describeEnv("S3_AVATAR_ACCESS_KEY_ID"),
    s3AvatarSecretAccessKey: describeEnv("S3_AVATAR_SECRET_ACCESS_KEY"),
  });
}
