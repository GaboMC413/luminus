import React from "react";
import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | LUMINUS Latam",
  description: "Encuentra respuestas a las dudas más comunes sobre la plataforma de bienestar LUMINUS, suscripciones, especialistas, eventos y privacidad.",
};

export default function FAQPage() {
  return <FAQClient />;
}
