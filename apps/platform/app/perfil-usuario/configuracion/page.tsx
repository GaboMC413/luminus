"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";

export default function SettingsIndexPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsRedirectHandler />
    </Suspense>
  );
}

function SettingsRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    const queryString = params.toString() ? `?${params.toString()}` : "";

    if (tab === "membership") {
      router.replace(`/perfil-usuario/configuracion/membresia${queryString}`);
      return;
    }
    if (tab === "password") {
      router.replace(`/perfil-usuario/configuracion/contrasena${queryString}`);
      return;
    }
    if (tab === "phone") {
      router.replace(`/perfil-usuario/configuracion/celular${queryString}`);
      return;
    }
    if (tab === "email") {
      router.replace(`/perfil-usuario/configuracion/email${queryString}`);
      return;
    }
    if (tab === "personal") {
      router.replace(`/perfil-usuario/configuracion/personal${queryString}`);
      return;
    }

    // Default desktop users to /personal subpage
    if (window.innerWidth >= 768) {
      router.replace(`/perfil-usuario/configuracion/personal${queryString}`);
    }
  }, [router, searchParams]);

  return null;
}
