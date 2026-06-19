import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ message: "Endpoint no longer active" }, { status: 410 });
}

