import { renderRelaunchNewsletterHtml } from "@/lib/mails/relaunchNewsletter";

export const dynamic = "force-dynamic";

export default function StandaloneEmailPreviewPage() {
  const html = renderRelaunchNewsletterHtml({
    nombre: "Gabriel",
    unsubscribeUrl: "#",
  });

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "20px 0" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
