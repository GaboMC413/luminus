import React from "react";
import type { Metadata } from "next";
import ContactoClient from "./ContactoClient";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Contacto y Soporte",
  description: "Escríbenos. Estamos aquí para guiarte, responder tus inquietudes y ayudarte a dar tus primeros pasos en la red de bienestar de LUMINUS.",
};

export default function ContactoPage() {
  return <ContactoClient />;
}
