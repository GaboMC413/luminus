export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Por favor, completa la verificación de seguridad (anti-bot)." };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY no está configurado. Permitiendo bypass en desarrollo.");
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      console.error("[Turnstile Verification Failed]:", data);
      return {
        success: false,
        error: "La verificación de seguridad anti-bot falló o expiró. Por favor vuelve a intentarlo.",
      };
    }
  } catch (err: any) {
    console.error("[Turnstile Verification Error]:", err);
    return {
      success: false,
      error: "Error interno al verificar la seguridad anti-bot.",
    };
  }
}
