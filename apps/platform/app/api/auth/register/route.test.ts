import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/db";
import { signUpWithCognito } from "@/lib/auth/cognito-password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

// 1. Mock de Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

// 2. Mock de Cognito
vi.mock("@/lib/auth/cognito-password", () => ({
  signUpWithCognito: vi.fn(),
  getCognitoErrorMessage: vi.fn((err, fallback) => fallback),
  getCognitoErrorStatus: vi.fn(() => 500),
}));

// 3. Mock de Sesiones
vi.mock("@/lib/auth/session", () => ({
  createSessionToken: vi.fn(() => "mock-token"),
  setSessionCookie: vi.fn(),
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  it("debería retornar 400 si la validación falla (ej. contraseña débil)", async () => {
    const req = createRequest({ email: "test@example.com", password: "123" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("La contrasena debe tener al menos 8 caracteres.");
    expect(prisma.user.findUnique).not.toHaveBeenCalled(); // Aseguramos que no tocó la base de datos
  });

  it("debería retornar 409 si el correo ya existe en la base de datos", async () => {
    // Simulamos que prisma encuentra un usuario
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "existing-id",
      status: "active",
    } as any);

    const req = createRequest({ email: "existente@example.com", password: "Password123!" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.message).toBe("Ya existe una cuenta registrada con este correo.");
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(signUpWithCognito).not.toHaveBeenCalled(); // No debe intentar crear en Cognito
  });

  it("debería llamar a Cognito y crear el usuario si todo es válido", async () => {
    // 1. Prisma no encuentra al usuario (es nuevo)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    
    // 2. Cognito responde exitosamente que se creó, pero falta verificar email
    vi.mocked(signUpWithCognito).mockResolvedValueOnce({
      userSub: "cognito-uuid-123",
      userConfirmed: false,
    });

    const req = createRequest({ email: "nuevo@example.com", password: "Password123!" });
    const res = await POST(req);
    const data = await res.json();

    // Verificamos el flujo
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "nuevo@example.com" },
      select: { id: true, status: true },
    });
    
    expect(signUpWithCognito).toHaveBeenCalledWith("nuevo@example.com", "Password123!");

    // Prisma no se llama para crear el usuario local si no está confirmado, 
    // en este código, prisma.user.create SI se llama siempre, veamos:
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    
    // Como userConfirmed es falso, debe devolver 202 REQUIRES_VERIFICATION
    expect(res.status).toBe(202);
    expect(data.code).toBe("REQUIRES_VERIFICATION");
    expect(createSessionToken).not.toHaveBeenCalled();
  });
});
