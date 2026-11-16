import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleApiError,
  isPrismaError,
  isStripeError,
  redactSensitiveText,
  sanitizeErrorForLog,
} from "./server-error";

describe("server-error utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("redacts PostgreSQL URLs, Stripe keys, AWS keys, Bearer tokens, and secrets", () => {
    const raw =
      "Can't reach postgresql://admin:supersecret@db.internal:5432/luminus with sk_live_1234567890abcdef and Bearer eyJhbGciOiJIUzI1NiJ9.abc.def and AKIAIOSFODNN7EXAMPLE";
    const redacted = redactSensitiveText(raw);

    expect(redacted).not.toContain("supersecret");
    expect(redacted).not.toContain("db.internal");
    expect(redacted).not.toContain("sk_live_1234567890abcdef");
    expect(redacted).not.toContain("eyJhbGciOiJIUzI1NiJ9");
    expect(redacted).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(redacted).toContain("postgresql://[REDACTED]");
    expect(redacted).toContain("[REDACTED_STRIPE_KEY]");
    expect(redacted).toContain("Bearer [REDACTED]");
    expect(redacted).toContain("[REDACTED_AWS_KEY]");
  });

  it("detects Prisma errors and never exposes SQL or Prisma details to clients", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const prismaErr = Object.assign(
      new Error("Invalid `prisma.user.update()` invocation: Unique constraint failed on the fields: (`email`)"),
      { name: "PrismaClientKnownRequestError", code: "P2002" }
    );

    expect(isPrismaError(prismaErr)).toBe(true);

    const res = handleApiError(prismaErr, {
      context: "[test/prisma]",
      message: "No fue posible guardar los datos.",
      conflictMessage: "Este correo ya está registrado.",
    });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toBe("Este correo ya está registrado.");
    expect(body.errorId).toMatch(/^[A-F0-9]{8}$/);
    expect(res.headers.get("X-Error-Id")).toBe(body.errorId);
    expect(JSON.stringify(body)).not.toContain("prisma");
    expect(JSON.stringify(body)).not.toContain("P2002");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("maps Prisma P2025 to 404 and unknown Prisma errors to 500 without leaking message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const notFoundErr = Object.assign(new Error("Record to update not found."), {
      name: "PrismaClientKnownRequestError",
      code: "P2025",
    });

    const res404 = handleApiError(notFoundErr, {
      context: "[test/p2025]",
      message: "Error genérico.",
    });
    expect(res404.status).toBe(404);

    const dbDownErr = Object.assign(
      new Error("P1001: Can't reach database server at `rds.amazonaws.com:5432`"),
      { name: "PrismaClientInitializationError", code: "P1001" }
    );
    const res500 = handleApiError(dbDownErr, {
      context: "[test/p1001]",
      message: "No pudimos completar la operación.",
    });
    const body500 = await res500.json();

    expect(res500.status).toBe(500);
    expect(body500.message).toBe("No pudimos completar la operación.");
    expect(JSON.stringify(body500)).not.toContain("rds.amazonaws.com");
    expect(JSON.stringify(body500)).not.toContain("P1001");
  });

  it("hides internal Stripe errors while allowing safe StripeCardError messages", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const internalStripeErr = Object.assign(
      new Error("No such price: 'price_12345_internal'"),
      { type: "StripeInvalidRequestError" }
    );
    expect(isStripeError(internalStripeErr)).toBe(true);

    const resInternal = handleApiError(internalStripeErr, {
      context: "[test/stripe-internal]",
      message: "Error al procesar la suscripción.",
    });
    const bodyInternal = await resInternal.json();
    expect(resInternal.status).toBe(500);
    expect(bodyInternal.message).toBe("Error al procesar la suscripción.");
    expect(JSON.stringify(bodyInternal)).not.toContain("price_12345_internal");

    const cardErr = Object.assign(new Error("Your card was declined."), {
      type: "StripeCardError",
    });
    const resCard = handleApiError(cardErr, {
      context: "[test/stripe-card]",
      message: "Error al procesar la tarjeta.",
    });
    const bodyCard = await resCard.json();
    expect(resCard.status).toBe(400);
    expect(bodyCard.message).toBe("Your card was declined.");
  });

  it("sanitizes Error objects for server logs without dropping stack or code", () => {
    const err = Object.assign(new Error("Failed with token=abc123xyz"), {
      code: "ECONNREFUSED",
      statusCode: 503,
    });
    const sanitized = sanitizeErrorForLog(err);
    expect(sanitized.code).toBe("ECONNREFUSED");
    expect(sanitized.statusCode).toBe(503);
    expect(sanitized.message).toBe("Failed with token=[REDACTED]");
    expect(sanitized.stack).toBeTruthy();
  });
});
