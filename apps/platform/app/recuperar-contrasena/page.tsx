import type { Metadata } from "next";
import ForgotPasswordView from "@/features/auth/ForgotPasswordView";

export const metadata: Metadata = {
  title: "Recuperar contraseña — LUMINUS",
  description: "Recupera el acceso a tu cuenta de LUMINUS.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
