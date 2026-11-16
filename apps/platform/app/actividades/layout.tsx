import { assertOnboarded } from "@/lib/auth/session";
import { ActividadesLayoutClient } from "./ActividadesLayoutClient";

export const metadata = {
  title: "Actividades | LUMINUS",
  description: "Descubre eventos, talleres y charlas en vivo de bienestar.",
};

export default async function ActividadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertOnboarded("/actividades");

  return <ActividadesLayoutClient>{children}</ActividadesLayoutClient>;
}
