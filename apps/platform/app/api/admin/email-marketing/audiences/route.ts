import { NextResponse } from "next/server";
import {
  getLocalAudiences,
  saveLocalAudience,
  deleteLocalAudience,
} from "@/lib/local-marketing/store";

export async function GET() {
  try {
    const audiences = getLocalAudiences();
    return NextResponse.json({ audiences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "El nombre de la audiencia es obligatorio." }, { status: 400 });
    }

    const saved = saveLocalAudience(body);
    return NextResponse.json({ audience: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    const success = deleteLocalAudience(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
