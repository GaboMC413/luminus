import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { checkAndTriggerQuestCompletion } from "@/lib/onboarding";

export const runtime = "nodejs";

export async function POST() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    // Manually trigger completion for the "follow" quest
    const result = await checkAndTriggerQuestCompletion(session.userId, "follow");
    return NextResponse.json({
      success: true,
      newlyCompletedQuests: result ? [result] : [],
    });
  } catch (error) {
    console.error("Failed to complete follow quest", error);
    return NextResponse.json({ message: "No se pudo registrar la acción." }, { status: 500 });
  }
}
