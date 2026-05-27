const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthValidationResult =
  | { ok: true; email: string; password: string }
  | { ok: false; message: string };

export function validateAuthInput(input: unknown): AuthValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "Los datos enviados no son validos." };
  }

  const { email, password } = input as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, message: "Correo y contrasena son obligatorios." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { ok: false, message: "Ingresa un correo electronico valido." };
  }

  if (password.length < 12) {
    return { ok: false, message: "La contrasena debe tener al menos 12 caracteres." };
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { ok: false, message: "La contrasena debe incluir al menos una letra y un numero." };
  }

  return { ok: true, email: normalizedEmail, password };
}

export function serializeUser(user: {
  id: string;
  email: string;
  emailVerified: boolean;
  profile?: {
    firstName: string | null;
    lastName: string | null;
    isOnboarded: boolean;
  } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    role: "USER",
    emailVerified: user.emailVerified,
    onboardingStatus: user.profile?.isOnboarded ? "COMPLETED" : "PENDING",
  };
}
