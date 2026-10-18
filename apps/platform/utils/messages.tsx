import React from "react";

export function formatMessageBody(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex to match Markdown links: [Text](URL)
  const markdownLinkRegex = /(\[[^\]]+\]\((?:https?:\/\/[^\s)]+|\/[^\s)]+|#[^\s)]+)\))/g;
  
  const parts = text.split(markdownLinkRegex);

  return parts.map((part, index) => {
    // Check if the part matches the markdown link pattern
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[([^\]]+)\]\(((?:https?:\/\/[^\s)]+|\/[^\s)]+|#[^\s)]+))\)/);
      if (match) {
        const [, linkText, url] = match;
        const isExternal = url.startsWith("http://") || url.startsWith("https://");
        return (
          <a
            key={index}
            href={url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="underline hover:opacity-80 transition-opacity font-semibold break-all"
          >
            {linkText}
          </a>
        );
      }
    }

    // Otherwise, parse standard URLs, bold (*) and italics (_)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const subParts = part.split(urlRegex);

    return (
      <React.Fragment key={index}>
        {subParts.map((subPart, subIndex) => {
          if (subPart.match(urlRegex)) {
            return (
              <a
                key={subIndex}
                href={subPart}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity font-semibold break-all"
              >
                {subPart}
              </a>
            );
          }

          const boldRegex = /\*([^*]+)\*/g;
          const boldParts = subPart.split(boldRegex);

          return (
            <React.Fragment key={subIndex}>
              {boldParts.map((boldPart, boldIndex) => {
                if (boldIndex % 2 === 1) {
                  return <strong key={boldIndex} className="font-semibold">{boldPart}</strong>;
                }

                const italicRegex = /_([^_]+)_/g;
                const italicParts = boldPart.split(italicRegex);

                return (
                  <React.Fragment key={boldIndex}>
                    {italicParts.map((italicPart, italicIndex) => {
                      if (italicIndex % 2 === 1) {
                        return <em key={italicIndex} className="italic">{italicPart}</em>;
                      }
                      return italicPart;
                    })}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  });
}

export function formatShortTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatChatDateDivider(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = today.getTime() - msgDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoy";
  }

  if (diffDays === 1) {
    return "Ayer";
  }

  // Within the last 6 days: show the weekday (e.g. Domingo, Lunes, Martes, etc.)
  if (diffDays > 1 && diffDays <= 6) {
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ];
    return dayNames[date.getDay()];
  }

  // More than 6 days: show the date
  const dayNumber = date.getDate();
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const monthName = monthNames[date.getMonth()];

  return date.getFullYear() === now.getFullYear()
    ? `${dayNumber} de ${monthName}`
    : `${dayNumber} de ${monthName} de ${date.getFullYear()}`;
}

