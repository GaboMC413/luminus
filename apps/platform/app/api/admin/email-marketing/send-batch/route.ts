import { NextResponse } from "next/server";
import { executeCampaignBatchSend } from "@/lib/local-marketing/sender";

function checkLocalOnly() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.campaignId) {
      return NextResponse.json({ error: "El parámetro campaignId es requerido." }, { status: 400 });
    }

    const delayMs = typeof body.delayMs === "number" ? body.delayMs : 250;

    const result = await executeCampaignBatchSend(body.campaignId, { delayMs });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al ejecutar el envío en lote" }, { status: 500 });
  }
}
