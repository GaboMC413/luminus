import { describe, expect, it } from "vitest";
import {
  getIntroSessionEmailSubject,
  renderIntroSessionEmailHtml,
} from "./introSession";

describe("introSession email templates", () => {
  it("renders accepted_requester email with join link and what it is / is not guide", () => {
    const html = renderIntroSessionEmailHtml({
      variant: "accepted_requester",
      recipientName: "Ana",
      counterpartyName: "Dr. Pérez",
      friendlyDate: "Viernes 20 nov",
      startTime: "10:00",
      timezone: "America/Montevideo",
      meetingLink: "https://example.com/room-123",
      note: "Te espero puntual.",
    });

    expect(html).toContain("Unirse a la sesión");
    expect(html).toContain("https://example.com/room-123");
    expect(html).toContain("Qué es y qué no es esta sesión");
    expect(html).toContain("/legal/sesiones-introductorias");
    expect(html).not.toContain("Whereby");
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
