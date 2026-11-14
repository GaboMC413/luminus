export interface RegistrationErrorPayload {
  step: string;
  action: string;
  userEmail?: string;
  userName?: string;
  statusCode?: number | string;
  errorMessage: string;
  errorDetails?: any;
}

export function trackRegistrationError(payload: RegistrationErrorPayload): void {
  if (typeof window === "undefined") return;

  try {
    const userAgent = navigator.userAgent;
    const bodyData = {
      ...payload,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    // Use sendBeacon for high reliability or fallback to fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(bodyData)], { type: "application/json" });
      navigator.sendBeacon("/api/debug/registration-error", blob);
    } else {
      fetch("/api/debug/registration-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
        keepalive: true,
      }).catch((err) => {
        console.error("Failed to send registration error report:", err);
      });
    }
  } catch (err) {
    console.error("Error inside trackRegistrationError:", err);
  }
}
