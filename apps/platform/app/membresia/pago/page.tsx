import { Suspense } from "react";
import MembershipPaymentView from "@/features/membership/MembershipPaymentView";
import { PageLoader } from "@/components/ui/PageLoader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activa tu membresía — LUMINUS",
  description: "Completa tu pago seguro para activar tu membresía en LUMINUS.",
};

export default function MembresiaPagoPage() {
  return (
    <Suspense fallback={<PageLoader className="min-h-screen" />}>
      <MembershipPaymentView />
    </Suspense>
  );
}
