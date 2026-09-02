import { NextResponse } from "next/server";
import { syncAwsSuppressionListToLocalContacts } from "@/lib/local-marketing/awsSesAnalytics";

export async function POST() {
  try {
    const result = await syncAwsSuppressionListToLocalContacts();
    const details = `${result.complaintsCount} por Queja/Abuso y ${result.bouncesCount} por Rebote`;
    return NextResponse.json({
      success: true,
      message: `Sincronización completada. ${result.syncedCount} contacto(s) marcados/actualizados como desuscritos de ${result.totalSuppressed} en AWS (${details}).`,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error al sincronizar con AWS SES." },
      { status: 500 }
    );
  }
}
