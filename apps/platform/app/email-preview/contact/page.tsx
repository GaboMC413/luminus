"use client";

import { renderContactNotificationEmailHtml } from "@/lib/mails";

export default function ContactEmailPreviewPage() {
  const html = renderContactNotificationEmailHtml({
    nombre: "Gabriel",
    apellido: "Montenegro",
    email: "gabrielmedcap@hotmail.com",
    telefono: "+54 9 11 2345-6789",
    motivo: "Consulta General / Especialistas",
    mensaje: "Hola equipo de LUMINUS, me gustaría consultar acerca de cómo registrarme como profesional especialista en la plataforma.",
  });

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-12 flex justify-center items-center font-sans">
      <div className="w-full max-w-[640px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <iframe
          title="Notificación de Contacto"
          srcDoc={html}
          className="w-full h-[720px] border-none"
        />
      </div>
    </div>
  );
}
