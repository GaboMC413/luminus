import SignInView from "@/features/auth/SignInView";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresa a tu cuenta — LUMINUS",
  description: "Inicia sesión en LUMINUS para conectar con personas y especialistas en Latinoamérica.",
};

export default async function IniciarSesionPage() {
  await redirectIfAuthenticated();
  return <SignInView />;
}
