"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Send, Sparkles } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function ContactoClient() {
  // Form states
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    motivo: "",
    mensaje: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      // Split full name if needed
      const nameParts = formData.nombre.trim().split(" ");
      const nombre = nameParts[0] || "";
      const apellido = nameParts.slice(1).join(" ") || formData.apellido || "N/A";

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          email: formData.email,
          telefono: formData.telefono,
          motivo: formData.motivo,
          mensaje: formData.mensaje,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "No pudimos enviar tu mensaje. Intenta nuevamente.");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28 min-h-[80vh] flex items-center">
      {/* Decorative background glows */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-[#FFE0C2]/10 via-[#DCE6FF]/10 to-transparent" />
      <div className="absolute right-0 top-1/4 w-72 h-72 bg-[#F4F8B8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-3xl w-full px-6">
        
        {/* Render Success Card State */}
        {isSuccess ? (
          <div className="card rounded-3xl border border-slate-200/80 bg-white/80 p-8 md:p-12 text-center shadow-soft animate-fadeIn max-w-2xl mx-auto border-t-4 border-t-emerald-500">
            {/* Animated Check Circle icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-soft mb-8 mx-auto">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            {/* Success title */}
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
              ¡Mensaje enviado con éxito!
            </h2>

            {/* Dynamic thank you text */}
            <p className="text-base leading-relaxed text-slate-600 font-medium mb-8">
              Muchas gracias por ponerte en contacto con nosotros, <strong className="text-slate-900 font-bold">{formData.nombre}</strong>. Tu consulta ha sido recibida correctamente. Uno de nuestros guías de bienestar se comunicará contigo a <strong className="text-slate-900 font-bold">{formData.email}</strong>{formData.telefono ? <> o a tu teléfono <strong className="text-slate-900 font-bold">{formData.telefono}</strong></> : ""} en menos de 24 horas para acompañarte en tus dudas.
            </p>

            {/* Back action */}
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-black py-3.5 px-8 text-base font-semibold text-white shadow-soft hover:shadow-medium hover:bg-neutral-900 transition-all duration-200"
            >
              Volver al Inicio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Render Active Form Card State */
          <div className="card rounded-3xl border border-slate-200/80 bg-white/85 p-8 md:p-12 shadow-soft hover:shadow-medium transition-all duration-300">
            
            {/* Form Header */}
            <div className="text-center mb-10 max-w-xl mx-auto animate-fadeIn">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0450FB] text-white border border-[#0450FB]/10 shadow-soft mb-5 mx-auto">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl mb-3">
                ¿Tienes dudas o consultas?
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium">
                Escríbenos. Estamos aquí para guiarte, responder tus inquietudes y ayudarte a dar tus primeros pasos en la red LUMINUS.
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nombre Input */}
                <div className="text-left">
                  <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pl-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    placeholder="Ingresa tu nombre y apellido"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0450FB] focus:outline-none focus:ring-4 focus:ring-[#0450FB]/10 transition-all duration-300"
                  />
                </div>

                {/* Email Input */}
                <div className="text-left">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pl-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Ingresa tu correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0450FB] focus:outline-none focus:ring-4 focus:ring-[#0450FB]/10 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Teléfono Input */}
              <div className="text-left">
                <label htmlFor="telefono" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pl-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  placeholder="Ingresa tu teléfono de contacto"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0450FB] focus:outline-none focus:ring-4 focus:ring-[#0450FB]/10 transition-all duration-300"
                />
                <span className="block text-[11px] text-slate-400 font-medium mt-1.5 pl-1 leading-normal">
                  Opcional. Lo usaremos solo si es necesario para responder mejor tu consulta.
                </span>
              </div>

              {/* Motivo de consulta Dropdown Select */}
              <div className="text-left">
                <label htmlFor="motivo" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pl-1">
                  Motivo de consulta
                </label>
                <select
                  id="motivo"
                  name="motivo"
                  required
                  value={formData.motivo}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0450FB] focus:outline-none focus:ring-4 focus:ring-[#0450FB]/10 transition-all duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25em 1.25em',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <option value="" disabled hidden>
                    Selecciona el motivo de tu consulta
                  </option>
                  <option value="Quiero saber más sobre LUMINUS">Quiero saber más sobre LUMINUS</option>
                  <option value="Quiero participar como especialista">Quiero participar como especialista</option>
                  <option value="Represento a una empresa u organización">Represento a una empresa u organización</option>
                  <option value="Tengo una consulta sobre eventos">Tengo una consulta sobre eventos</option>
                  <option value="Tengo una consulta sobre mi cuenta">Tengo una consulta sobre mi cuenta</option>
                  <option value="Quiero proponer una colaboración">Quiero proponer una colaboración</option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>

              {/* Mensaje Textarea */}
              <div className="text-left">
                <label htmlFor="mensaje" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pl-1">
                  Tu mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte"
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0450FB] focus:outline-none focus:ring-4 focus:ring-[#0450FB]/10 transition-all duration-300 resize-none"
                />
                <span className="block text-[11px] text-slate-400 font-medium mt-1.5 pl-1 leading-normal">
                  Puedes incluir el contexto de tu consulta, dudas específicas o el tipo de contacto que estás buscando.
                </span>
              </div>

              <TurnstileWidget
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />

              {errorMessage && (
                <p className="text-sm font-bold text-red-600 text-center tracking-tight my-2">
                  {errorMessage}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-full bg-black py-3.5 px-6 text-base font-semibold text-white shadow-soft hover:shadow-medium hover:bg-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    Enviar mensaje
                    <Send className="ml-2 h-4 w-4 text-white" />
                  </>
                )}
              </button>
            </form>

            {/* Subtle disclaimer */}
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium mt-5 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-[#FF7700]" />
              Priorizamos tu privacidad. Los datos enviados serán protegidos y de uso exclusivo para tu consulta.
            </p>
          </div>
        )}
        
      </div>
    </section>
  );
}
