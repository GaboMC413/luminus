"use client";

import React, { useRef } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error?: any) => void;
  onExpire?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  className = "my-0 flex justify-center overflow-hidden min-h-0 h-0 w-0 opacity-0",
  theme = "light",
}: TurnstileWidgetProps) {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  return (
    <div className={className}>
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: theme,
          size: "invisible",
          appearance: "interaction-only",
        }}
      />
    </div>
  );
}

export default TurnstileWidget;
