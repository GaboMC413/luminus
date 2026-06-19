import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { EspecialistasLayoutClient } from "./EspecialistasLayoutClient";

export default function EspecialistasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getCurrentSession();

  if (!session) {
    redirect("/auth/iniciar-sesion");
  }

  return <EspecialistasLayoutClient>{children}</EspecialistasLayoutClient>;
}
