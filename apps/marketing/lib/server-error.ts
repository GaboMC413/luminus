import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export interface SanitizedErrorLog {
  name: string;
  code?: string;
  statusCode?: number;
  message: string;
  stack?: string;
}

const SENSITIVE_PATTERNS: Array<[RegExp, string]> = [
  [/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "postgresql://[REDACTED]"],
  [/\b(password|passwd|pwd|secret|token|api[_-]?key)=([^\s&"'`]+)/gi, "$1=[REDACTED]"],
  [/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]"],
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
    const rawStatus = anyErr.statusCode ?? anyErr.status;
    return {
      name: anyErr.name || "Error",
      ...(typeof anyErr.code === "string" ? { code: anyErr.code } : {}),
      ...(typeof rawStatus === "number" ? { statusCode: rawStatus } : {}),
      message: redactSensitiveText(anyErr.message || "Unexpected error"),
      ...(anyErr.stack ? { stack: redactSensitiveText(anyErr.stack) } : {}),
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

export function handleMarketingApiError(
  error: unknown,
  options: { context: string; error: string; status?: number }
) {
  const errorId = logServerError(options.context, error);
  return NextResponse.json(
    { error: options.error, errorId },
    { status: options.status ?? 500, headers: { "X-Error-Id": errorId } }
  );
}
