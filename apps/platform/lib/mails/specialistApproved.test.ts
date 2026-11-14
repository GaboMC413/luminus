import { describe, expect, it } from "vitest";
import {
  renderSpecialistApprovedEmailHtml,
  SPECIALIST_APPROVED_EMAIL_SUBJECT,
} from "./specialistApproved";

describe("specialistApproved email template", () => {
  it("renders corporate welcome email with specialist summary and program guide", () => {
    const html = renderSpecialistApprovedEmailHtml({
      name: "Sofía Martínez",
      title: "Lic. en Psicología",
      specialty: "Psicología Clínica",
      selectedAreas: ["Bienestar Emocional", "Mindfulness"],
      clinicName: "Espacio Calma",
      coursesCount: 2,
    });

    expect(SPECIALIST_APPROVED_EMAIL_SUBJECT).toBe(
      "Te damos la bienvenida como Especialista en LUMINUS"
    );
    expect(html).toContain("Ya eres Especialista en LUMINUS");
    expect(html).toContain("Sofía Martínez");
    expect(html).toContain("Lic. en Psicología");
    expect(html).toContain("Psicología Clínica");
    expect(html).toContain("Bienestar Emocional · Mindfulness");
    expect(html).toContain("Espacio Calma");
    expect(html).toContain("2 cursos registrados");
    expect(html).toContain("Sesiones introductorias de 15 minutos");
    expect(html).toContain("/legal/condiciones-especialistas");
    expect(html).toContain("/perfil-usuario");
    expect(html).not.toContain("¡Tu postulación");
  });

  it("escapes HTML in user-provided fields and omits summary card when empty", () => {
    const html = renderSpecialistApprovedEmailHtml({
      name: '<script>alert("xss")</script>',
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("Resumen de tu perfil aprobado");
  });
});
