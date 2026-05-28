import React from "react";

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1.5 mb-8">
      <h2 className="text-card-title font-jakarta">{title}</h2>
      {description && <p className="text-body-small font-jakarta">{description}</p>}
    </div>
  );
}
