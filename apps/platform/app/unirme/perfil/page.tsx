import CompleteProfileView from "@/features/membership/CompleteProfileView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completa tu perfil — LUMINUS",
  description: "Personaliza tu perfil para conectar con otros miembros en LUMINUS.",
};

export default function UnirmePerfilPage() {
  return <CompleteProfileView />;
}
