import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export type ErrorResponseField = "message" | "error";

export interface HandleApiErrorOptions {
  context: string;
  message: string;
  field?: ErrorResponseField;
  status?: number;
  conflictMessage?: string;
  notFoundMessage?: string;
  extra?: Record<string, unknown>;
}

export interface SanitizedErrorLog {
  name: string;
  code?: string;
  statusCode?: number;
  message: string;
  stack?: string;
}

const SENSITIVE_PATTERNS: Array<[RegExp, string]> = [
  [/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "postgresql://[REDACTED]"],
  [/\b(password|passwd|pwd|secret|token|api[_-]?key|secret[_-]?hash|client[_-]?secret)=([^\s&"'`]+)/gi, "$1=[REDACTED]"],
  [/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]"],
  [/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,}\b/g, "[REDACTED_STRIPE_KEY]"],
  [/\bwhsec_[A-Za-z0-9]{10,}\b/g, "[REDACTED_WEBHOOK_SECRET]"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED_AWS_KEY]"],
];

export function createErrorId(): string {
  return randomUUID().slice(0, 8).toUpperCase();
}

export function redactSensitiveText(input: string): string {
  let redacted = input;
  for (const [pattern, replacement] of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, replacement);
  }
  if (process.env.DATABASE_URL) {
    redacted = redacted.split(process.env.DATABASE_URL).join("[REDACTED_DATABASE_URL]");
  }
  return redacted;
}

export function sanitizeErrorForLog(error: unknown): SanitizedErrorLog {
  if (error instanceof Error) {
    const anyErr = error as Error & { code?: unknown; statusCode?: unknown; status?: unknown };
    const code = typeof anyErr.code === "string" ? anyErr.code : undefined;
    const rawStatus = anyErr.statusCode ?? anyErr.status;
    const statusCode = typeof rawStatus === "number" ? rawStatus : undefined;

    return {
      name: anyErr.name || "Error",
      ...(code ? { code } : {}),
      ...(statusCode ? { statusCode } : {}),
      message: redactSensitiveText(anyErr.message || "Unexpected error"),
      ...(anyErr.stack ? { stack: redactSensitiveText(anyErr.stack) } : {}),
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? record.name : "UnknownError",
      ...(typeof record.code === "string" ? { code: record.code } : {}),
      ...(typeof record.statusCode === "number" ? { statusCode: record.statusCode } : {}),
      message: redactSensitiveText(
        typeof record.message === "string" ? record.message : "Non-Error object thrown"
      ),
    };
  }

  return {
    name: "UnknownError",
    message: redactSensitiveText(String(error ?? "Unknown error")),
  };
}

export function logServerError(context: string, error: unknown, errorId = createErrorId()): string {
  console.error(`${context} [errorId=${errorId}]`, sanitizeErrorForLog(error));
  return errorId;
}

export function isPrismaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: unknown; code?: unknown; constructor?: { name?: string } };
  if (typeof err.name === "string" && err.name.startsWith("PrismaClient")) return true;
  if (typeof err.constructor?.name === "string" && err.constructor.name.startsWith("PrismaClient")) {
    return true;
  }
  return typeof err.code === "string" && /^P\d{4}$/.test(err.code);
}

export function isStripeError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { type?: unknown; name?: unknown };
  if (typeof err.type === "string" && err.type.startsWith("Stripe")) return true;
  return typeof err.name === "string" && err.name.startsWith("Stripe");
}

function buildErrorResponse(
  field: ErrorResponseField,
  message: string,
  errorId: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      ...extra,
      [field]: message,
      errorId,
    },
    {
      status,
      headers: { "X-Error-Id": errorId },
    }
  );
}

/**
 * Standardized API error handler: logs redacted technical details server-side
 * with a correlation errorId and returns a safe, user-friendly JSON response.
 */
export function handleApiError(error: unknown, options: HandleApiErrorOptions) {
  const field = options.field ?? "message";
  const errorId = logServerError(options.context, error);

  if (isPrismaError(error)) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return buildErrorResponse(
        field,
        options.conflictMessage ?? "Ya existe un registro con esos datos.",
        errorId,
        409,
        options.extra
      );
    }
    if (code === "P2025") {
      return buildErrorResponse(
        field,
        options.notFoundMessage ?? "El recurso solicitado no fue encontrado.",
        errorId,
        404,
        options.extra
      );
    }
    return buildErrorResponse(field, options.message, errorId, 500, options.extra);
  }

  if (isStripeError(error)) {
    const stripeErr = error as { type?: string; message?: string };
    if (stripeErr.type === "StripeCardError") {
      return buildErrorResponse(
        field,
        stripeErr.message || "No pudimos procesar tu tarjeta. Verifica los datos e intenta de nuevo.",
        errorId,
        400,
        options.extra
      );
    }
    return buildErrorResponse(field, options.message, errorId, 500, options.extra);
  }

  return buildErrorResponse(
    field,
    options.message,
    errorId,
    options.status ?? 500,
    options.extra
  );
}
