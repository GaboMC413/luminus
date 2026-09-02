import { NextResponse } from "next/server";
import { getAwsSesAccountMetrics } from "@/lib/local-marketing/awsSesAnalytics";

export async function GET() {
  try {
    const metrics = await getAwsSesAccountMetrics();
    if (!metrics) {
      return NextResponse.json(
        { success: false, error: "No se pudieron obtener métricas de AWS SES." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error al consultar AWS SES." },
      { status: 500 }
    );
  }
}
