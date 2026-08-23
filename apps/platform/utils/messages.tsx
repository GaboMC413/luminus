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
