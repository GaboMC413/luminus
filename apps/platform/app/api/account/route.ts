import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No estas autenticado." }, { status: 401 });
  }

  try {

    // We do NOT delete from Cognito here because we need their credentials
    // to validate them when they try to reactivate the account via login.
    // We only perform a logical delete in Prisma.
    await prisma.user.update({
      where: { id: session.userId },
      data: { status: "deleted" },
    });

    clearSessionCookie();

    return NextResponse.json({ success: true, message: "Cuenta eliminada correctamente." });
  } catch (error) {
    console.error("Account deletion failed.", error);
    return NextResponse.json({ message: "No pudimos eliminar la cuenta." }, { status: 500 });
  }
}
