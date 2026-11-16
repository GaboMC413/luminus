"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_UPDATED_EVENT, hasConsented } from "@/lib/cookie-consent";

interface GoogleAnalyticsProps {
  measurementId: string;
  scriptId?: string;
}

export function GoogleAnalytics({
  measurementId,
  scriptId = "google-analytics",
}: GoogleAnalyticsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasConsented("analytics"));
    sync();
    window.addEventListener(CONSENT_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, sync);
  }, []);

  if (!enabled || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id={scriptId}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}
