import { describe, expect, it } from "vitest";
import {
  getIntroSessionEmailSubject,
  renderIntroSessionEmailHtml,
} from "./introSession";

describe("introSession email templates", () => {
  it("renders accepted_requester email with title first, centered summary, contextual message, and emerald/rose guide cards", () => {
    const html = renderIntroSessionEmailHtml({
      variant: "accepted_requester",
      recipientName: "Ana",
      counterpartyName: "Dr. Pérez",
      friendlyDate: "viernes, 20 de noviembre de 2026",
      startTime: "10:00",
      timezone: "America/Montevideo",
      meetingLink: "https://example.com/room-123",
      note: "Te espero puntual.",
    });

    const headingIdx = html.indexOf("¡Tu sesión introductoria está confirmada!");
    const greetingIdx = html.indexOf("Hola Ana,");
    expect(headingIdx).toBeGreaterThan(-1);
    expect(greetingIdx).toBeGreaterThan(headingIdx);

    expect(html).toContain("15 minutos con Dr. Pérez");
    expect(html).toContain("Viernes, 20 de noviembre de 2026");
    expect(html).toContain("10:00 hs");
    expect(html).toContain("America/Montevideo");
    expect(html).toContain("Mensaje de Dr. Pérez");
    expect(html).not.toContain("<strong>Nota:</strong>");

    expect(html).toContain("Unirse a la sesión");
    expect(html).toContain("https://example.com/room-123");
    expect(html).toContain("Una charla introductoria de 15 minutos sin costo");
    expect(html).toContain("No es una consulta completa, diagnóstico ni tratamiento");
    expect(html).toContain("/legal/sesiones-introductorias");
    expect(html).not.toContain("Whereby");
  });

  it("never includes meetingLink in pre-confirmation or cancelled emails", () => {
    const html = renderIntroSessionEmailHtml({
      variant: "requested_specialist",
      recipientName: "Dr. Pérez",
      counterpartyName: "Ana",
      friendlyDate: "viernes, 20 de noviembre de 2026",
      startTime: "10:00",
      timezone: "America/Montevideo",
      meetingLink: "https://luminus.whereby.com/secret-room",
      note: "Quiero conversar sobre bienestar.",
    });

    expect(html).not.toContain("https://luminus.whereby.com/secret-room");
    expect(html).toContain("Mensaje de Ana");
    expect(html).toContain("Revisar solicitud");
  });

  it("renders requested_requester confirmation subject", () => {
    const subject = getIntroSessionEmailSubject({
      variant: "requested_requester",
      recipientName: "Ana",
      counterpartyName: "Dr. Pérez",
      friendlyDate: "Viernes 20 nov",
      startTime: "10:00",
      timezone: "America/Montevideo",
    });

    expect(subject).toContain("Recibimos tu solicitud");
    expect(subject).toContain("Dr. Pérez");
  });
});
