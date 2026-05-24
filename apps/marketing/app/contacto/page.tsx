"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Send, Sparkles } from "lucide-react";

export default function ContactoPage() {
  // Form states
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate high-fidelity network request (1 second timeout)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-luminus-bg to-white py-20 lg:py-28 min-h-[80vh] flex items-center">
      {/* Decorative background glows */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] bg-radial from-blue-50/40 to-transparent" />
      <div className="absolute right-0 top-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-3xl w-full px-6">
        
        {/* Render Success Card State */}
        {isSuccess ? (
          <div className="rounded-[2.5rem] border border-emerald-100 bg-white p-8 md:p-12 text-center shadow-premium-hover animate-fadeIn max-w-2xl mx-auto border-t-4 border-t-emerald-500">
            {/* Animated Check Circle icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-8 mx-auto shadow-sm">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            {/* Success title */}
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
              ¡Mensaje enviado con éxito!
            </h2>

            {/* Dynamic thank you text */}
            <p className="text-base leading-relaxed text-luminus-secondary mb-8">
              Muchas gracias por ponerte en contacto con nosotros, <strong className="text-slate-950 font-semibold">{formData.nombre}</strong>. Tu consulta ha sido recibida correctamente. Uno de nuestros guías de bienestar se comunicará contigo a <strong className="text-slate-950 font-semibold">{formData.email}</strong> o a tu teléfono <strong className="text-slate-950 font-semibold">{formData.telefono}</strong> en menos de 24 horas para acompañarte en tus dudas.
            </p>

            {/* Back action */}
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-luminus-blue px-6 py-3.5 text-sm font-bold text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
            >
              Volver al Inicio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Render Active Form Card State */
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-300">
            
            {/* Form Header */}
            <div className="text-center mb-10 max-w-xl mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luminus-blue-soft text-luminus-blue border border-blue-100/50 mb-5 mx-auto shadow-sm">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-3">
                ¿Tienes dudas o consultas?
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-luminus-secondary">
                Escríbenos. Estamos aquí para guiarte, responder tus inquietudes y ayudarte a dar tus primeros pasos en la red LUMINUS.
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nombre Input */}
                <div className="text-left">
                  <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    placeholder="Ej. Gabriel Mendoza"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-luminus-blue focus:outline-none focus:ring-4 focus:ring-luminus-blue/10 transition-all duration-200"
                  />
                </div>

                {/* Email Input */}
                <div className="text-left">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Ej. contacto@luminuslatam.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-luminus-blue focus:outline-none focus:ring-4 focus:ring-luminus-blue/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Teléfono Input */}
              <div className="text-left">
                <label htmlFor="telefono" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  required
                  placeholder="Ej. +54 9 11 1234-5678"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-luminus-blue focus:outline-none focus:ring-4 focus:ring-luminus-blue/10 transition-all duration-200"
                />
              </div>

              {/* Mensaje Textarea */}
              <div className="text-left">
                <label htmlFor="mensaje" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                  Tu consulta o mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-luminus-blue focus:outline-none focus:ring-4 focus:ring-luminus-blue/10 transition-all duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-luminus-blue py-4 px-6 text-base font-bold text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 mt-2"
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
            <p className="text-[11px] leading-relaxed text-slate-400 mt-5 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-luminus-blue" />
              Priorizamos tu privacidad. Los datos enviados serán protegidos y de uso exclusivo para tu consulta.
            </p>
          </div>
        )}
        
      </div>
    </section>
  );
}
