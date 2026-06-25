import { assertOnboarded } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function PlatformHomePage() {
  await assertOnboarded();
  redirect("/comunidad");
}
