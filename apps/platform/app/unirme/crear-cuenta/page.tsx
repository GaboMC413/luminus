import { Suspense } from "react";
import AccountCreationView from "@/features/membership/AccountCreationView";
import { PageLoader } from "@/components/ui/PageLoader";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crea tu cuenta — LUMINUS",
  description: "Únete a la red LUMINUS para conectar con personas conscientes en Latinoamérica.",
};

export default async function UnirmeCrearCuentaPage() {
  await redirectIfAuthenticated();
  return (
    <Suspense fallback={<PageLoader className="min-h-screen" />}>
      <AccountCreationView />
    </Suspense>
  );
}
