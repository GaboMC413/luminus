import { NextResponse } from "next/server";
import { syncAwsSuppressionListToLocalContacts } from "@/lib/local-marketing/awsSesAnalytics";

export async function POST() {
  try {
    const result = await syncAwsSuppressionListToLocalContacts();
    return NextResponse.json({
      success: true,
      message: `Sincronización completada. ${result.syncedCount} contactos actualizados como desuscritos de ${result.totalSuppressed} registrados en AWS.`,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error al sincronizar con AWS SES." },
      { status: 500 }
    );
  }
}
