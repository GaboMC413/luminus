import React from "react";

interface DotSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function DotSpinner({ size = 40, color = "black", className = "" }: DotSpinnerProps) {
  return (
    <div
      className={`dot-spinner-container ${className}`}
      style={{
        ["--uib-size" as any]: `${size}px`,
        ["--uib-color" as any]: color,
      }}
    >
      <div className="dot-spinner-dot" />
      <div className="dot-spinner-dot" />
      <div className="dot-spinner-dot" />
      <div className="dot-spinner-dot" />
    </div>
  );
}
