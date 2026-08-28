import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { checkAndTriggerQuestCompletion } from "@/lib/onboarding";

// 1. Mock de Sesión
vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

// 2. Mock de Base de Datos
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

// 3. Mock de Onboarding (para que no falle si intentan importar la función)
vi.mock("@/lib/onboarding", () => ({
  checkAndTriggerQuestCompletion: vi.fn(),
}));

describe("/api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new Request("http://localhost/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  describe("Test 1: Rutas Protegidas (Autenticación)", () => {
    it("debería rechazar la petición GET con 401 si no hay sesión iniciada", async () => {
      // 1. Simulamos que el usuario NO está logueado
      vi.mocked(getCurrentSession).mockReturnValue(null);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.message).toBe("No autorizado.");
      
      // Aseguramos que los datos sensibles no fueron consultados
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("debería rechazar la petición PATCH con 401 si no hay sesión iniciada", async () => {
      vi.mocked(getCurrentSession).mockReturnValue(null);
      const req = createRequest({ first_name: "Hacker" });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.message).toBe("No autorizado.");
    });
  });

  describe("Test 2: Privacidad y Permisos (IDOR)", () => {
    it("solo debe usar el ID de la sesión segura para actualizar datos, ignorando cualquier ID enviado en la petición", async () => {
      // 1. Simulamos que quien inició sesión fue "usuario-legitimo-123"
      const sessionData = { userId: "usuario-legitimo-123", email: "legitimo@test.com", role: "USER" };
      vi.mocked(getCurrentSession).mockReturnValue(sessionData as any);

      // 2. El atacante intenta enviar un "userId" diferente (ej: "admin-456") en el cuerpo
      const req = createRequest({ 
        first_name: "Hacked",
        userId: "admin-456", 
        id: "admin-456" 
      });

      // 3. Simulamos la transacción de Prisma para que devuelva un perfil básico
      const mockProfile = { email: "legitimo@test.com", profile: { firstName: "Hacked" } };
      vi.mocked(prisma.$transaction).mockResolvedValue(mockProfile);

      await PATCH(req);

      // 4. Verificamos la regla de oro: Prisma SIEMPRE debió usar "usuario-legitimo-123"
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      
      // Obtenemos la función de callback enviada a prisma.$transaction
      const transactionCallback = vi.mocked(prisma.$transaction).mock.calls[0][0];
      
      // Creamos un falso "tx" para ver qué hubiera intentado hacer
      const txMock = {
        userProfile: { upsert: vi.fn() },
        userInterest: { deleteMany: vi.fn(), createMany: vi.fn() },
        categorySuggestion: { create: vi.fn() },
        userProfilePrompt: { deleteMany: vi.fn(), createMany: vi.fn() },
        interest: { findMany: vi.fn().mockResolvedValue([]) },
        user: { findUnique: vi.fn().mockResolvedValue(mockProfile) },
      };

      await transactionCallback(txMock);

      // AQUI ES DONDE COMPROBAMOS QUE SE EVITÓ EL IDOR:
      // Verificamos que el upsert intentó hacerse para "usuario-legitimo-123", y NO para "admin-456"
      expect(txMock.userProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "usuario-legitimo-123" }, // <--- El ID seguro
        })
      );
    });
  });

  describe("Test 3: Flujo Principal (Actualizar Perfil)", () => {
    it("debería actualizar los datos correctamente si la sesión es válida", async () => {
      const sessionData = { userId: "user-123", email: "test@test.com", role: "USER" };
      vi.mocked(getCurrentSession).mockReturnValue(sessionData as any);

      const req = createRequest({ 
        first_name: "Juan",
        last_name: "Pérez",
        profession: "Ingeniero"
      });

      // Mock de la transacción exitosa
      const mockUpdatedUser = { 
        email: "test@test.com", 
        profile: { firstName: "Juan", lastName: "Pérez", profession: "Ingeniero" } 
      };
      vi.mocked(prisma.$transaction).mockResolvedValue(mockUpdatedUser);

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.profile.first_name).toBe("Juan");
      expect(data.profile.profession).toBe("Ingeniero");

      // Verificamos que se guardó un registro de la actividad
      expect(prisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            action: "UPDATE_PROFILE",
          })
        })
      );
    });
  });
});
