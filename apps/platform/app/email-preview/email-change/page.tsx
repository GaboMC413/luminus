"use client";

import { renderEmailChangeVerificationHtml } from "@/lib/email/templates";

export default function EmailChangePreviewPage() {
  const html = renderEmailChangeVerificationHtml("654321");

  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-12 flex justify-center items-center font-sans">
      <div className="w-full max-w-[640px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <iframe
          title="Confirmación de Email"
          srcDoc={html}
          className="w-full h-[640px] border-none"
        />
      </div>
    </div>
  );
}
