import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default function PlatformHomePage() {
  const session = getCurrentSession();
  redirect(session ? "/comunidad" : "/auth/iniciar-sesion");
}
