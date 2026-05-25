import React from "react";
import { Container } from "./Container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  bg?: "white" | "slate-50" | "transparent";
  borderBottom?: boolean;
  withContainer?: boolean;
}

const bgClasses = {
  white: "bg-white",
  "slate-50": "bg-slate-50",
  transparent: "bg-transparent",
};

export function Section({
  children,
  className = "",
  bg = "white",
  borderBottom = false,
  withContainer = true,
  ...props
}: SectionProps) {
  return (
    <section
      className={`relative overflow-hidden py-24 ${bgClasses[bg]} ${
        borderBottom ? "border-b-2 border-black" : ""
      } ${className}`}
      {...props}
    >
      {withContainer ? <Container>{children}</Container> : children}
    </section>
  );
}
