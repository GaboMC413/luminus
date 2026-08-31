import { NextResponse } from "next/server";
import {
  getLocalCampaigns,
  saveLocalCampaign,
  deleteLocalCampaign,
  getLocalSendLogs,
} from "@/lib/local-marketing/store";

function checkLocalOnly() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  const campaigns = getLocalCampaigns();
  const logs = campaignId ? getLocalSendLogs(campaignId) : getLocalSendLogs();

  return NextResponse.json({ campaigns, logs });
}

export async function POST(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.subject || !body.htmlContent) {
      return NextResponse.json({ error: "El asunto y el contenido HTML son obligatorios." }, { status: 400 });
    }

    const campaign = saveLocalCampaign({
      id: body.id,
      subject: body.subject,
      previewText: body.previewText || "",
      fromEmail: body.fromEmail || process.env.SES_FROM_EMAIL || "info@luminuslatam.com",
      fromName: body.fromName || "LUMINUS LATAM",
      htmlContent: body.htmlContent,
      targetTags: body.targetTags || [],
      status: body.status || "DRAFT",
    });

    return NextResponse.json({ success: true, campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al guardar campaña" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "El parámetro ID es requerido" }, { status: 400 });
    }

    const deleted = deleteLocalCampaign(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al eliminar campaña" }, { status: 500 });
  }
}
