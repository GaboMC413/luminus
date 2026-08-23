import { assertOnboarded } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { EspecialistasLayoutClient } from "./EspecialistasLayoutClient";

export default async function EspecialistasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertOnboarded("/especialistas/onboarding");

  return <EspecialistasLayoutClient>{children}</EspecialistasLayoutClient>;
}
