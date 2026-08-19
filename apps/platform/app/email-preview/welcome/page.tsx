"use client";

import { renderWelcomeEmailHtml } from "@/lib/email/templates";

export default function WelcomeEmailPreviewPage() {
  const html = renderWelcomeEmailHtml("Gabriel");

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-12 flex justify-center items-center font-sans">
      <div className="w-full max-w-[640px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <iframe
          title="Email de Bienvenida"
          srcDoc={html}
          className="w-full h-[760px] border-none"
        />
      </div>
    </div>
  );
}
