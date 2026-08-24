import { describe, it, expect } from "vitest";
import { validateAuthInput, serializeUser } from "./validation";

describe("validateAuthInput", () => {
  it("debería retornar ok para un input válido", () => {
    const input = { email: "test@example.com", password: "Password123!" };
    const result = validateAuthInput(input);
    expect(result).toEqual({ ok: true, email: "test@example.com", password: "Password123!" });
  });

  it("debería normalizar el correo electrónico", () => {
    const input = { email: "  TEST@example.com  ", password: "Password123!" };
    const result = validateAuthInput(input);
    expect(result).toEqual({ ok: true, email: "test@example.com", password: "Password123!" });
  });

  it("debería rechazar si no se envía un objeto", () => {
    expect(validateAuthInput(null)).toEqual({ ok: false, message: "Los datos enviados no son validos." });
    expect(validateAuthInput(undefined)).toEqual({ ok: false, message: "Los datos enviados no son validos." });
    expect(validateAuthInput("string")).toEqual({ ok: false, message: "Los datos enviados no son validos." });
  });

  it("debería rechazar si faltan campos o no son strings", () => {
    expect(validateAuthInput({})).toEqual({ ok: false, message: "Correo y contrasena son obligatorios." });
    expect(validateAuthInput({ email: "test@test.com" })).toEqual({ ok: false, message: "Correo y contrasena son obligatorios." });
    expect(validateAuthInput({ email: 123, password: "Password123!" })).toEqual({ ok: false, message: "Correo y contrasena son obligatorios." });
  });

  it("debería rechazar correos inválidos", () => {
    const invalidEmails = ["test", "test@.com", "test@test", "@test.com", "test@test."];
    for (const email of invalidEmails) {
      expect(validateAuthInput({ email, password: "Password123!" })).toEqual({
        ok: false,
        message: "Ingresa un correo electronico valido.",
      });
    }
  });

  it("debería rechazar contraseñas cortas", () => {
    expect(validateAuthInput({ email: "test@example.com", password: "Pass1!" })).toEqual({
      ok: false,
      message: "La contrasena debe tener al menos 8 caracteres.",
    });
  });

  it("debería rechazar contraseñas sin mayúsculas o minúsculas", () => {
    expect(validateAuthInput({ email: "test@example.com", password: "password123!" })).toEqual({
      ok: false,
      message: "La contrasena debe incluir letras mayusculas y minusculas.",
    });
    expect(validateAuthInput({ email: "test@example.com", password: "PASSWORD123!" })).toEqual({
      ok: false,
      message: "La contrasena debe incluir letras mayusculas y minusculas.",
    });
  });

  it("debería rechazar contraseñas sin números o símbolos", () => {
    expect(validateAuthInput({ email: "test@example.com", password: "PasswordTest!" })).toEqual({
      ok: false,
      message: "La contrasena debe incluir al menos un numero y un simbolo.",
    });
    expect(validateAuthInput({ email: "test@example.com", password: "Password123" })).toEqual({
      ok: false,
      message: "La contrasena debe incluir al menos un numero y un simbolo.",
    });
  });
});

describe("serializeUser", () => {
  it("debería serializar un usuario completo correctamente", () => {
    const user = {
      id: "123",
      email: "test@example.com",
      emailVerified: true,
      role: "ADMIN" as const,
      profile: {
        firstName: "John",
        lastName: "Doe",
        avatarUrl: "https://example.com/avatar.jpg",
        isOnboarded: true,
      },
    };

    expect(serializeUser(user)).toEqual({
      id: "123",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      avatarUrl: "https://example.com/avatar.jpg",
      role: "ADMIN",
      emailVerified: true,
      onboardingStatus: "COMPLETED",
    });
  });

  it("debería serializar un usuario parcial (sin perfil)", () => {
    const user = {
      id: "123",
      email: "test@example.com",
      emailVerified: false,
      // sin rol y sin perfil
    };

    expect(serializeUser(user)).toEqual({
      id: "123",
      email: "test@example.com",
      firstName: null,
      lastName: null,
      avatarUrl: null,
      role: "USER",
      emailVerified: false,
      onboardingStatus: "PENDING",
    });
  });
});
