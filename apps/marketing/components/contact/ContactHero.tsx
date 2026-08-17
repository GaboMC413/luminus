"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { COUNTRIES, Country } from "@/lib/countries";

const MOTIVOS = [
  { value: "Quiero saber más sobre LUMINUS", label: "Quiero saber más sobre LUMINUS" },
  { value: "Quiero participar como especialista", label: "Quiero participar como especialista" },
  { value: "Represento a una empresa u organización", label: "Represento a una empresa u organización" },
  { value: "Tengo una consulta sobre eventos", label: "Tengo una consulta sobre eventos" },
  { value: "Tengo una consulta sobre mi cuenta", label: "Tengo una consulta sobre mi cuenta" },
  { value: "Quiero proponer una colaboración", label: "Quiero proponer una colaboración" },
  { value: "Otro motivo", label: "Otro motivo" },
];

export function ContactHero() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    motivo: "",
    mensaje: "",
  });
  const [phoneCountry, setPhoneCountry] = useState<Country | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.motivo) {
      setErrorMsg("Por favor selecciona un motivo de contacto.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const dialStr = phoneCountry?.dial ? `${phoneCountry.dial} ` : "";
      const phoneFull = form.telefono ? `${dialStr}${form.telefono}` : "";

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          telefono: phoneFull,
          pais: phoneCountry?.name || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error inesperado.");
      }

      setSubmitted(true);
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        motivo: "",
        mensaje: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full py-16 md:py-24 lg:py-28 bg-black text-white overflow-hidden flex justify-center items-center">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start justify-between">

        {/* Left Column: Black 50% */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 mb-12 lg:mb-0 flex flex-col justify-start items-start gap-6 text-left bg-black text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-normal tracking-tight text-white leading-[1.12] max-w-[520px]">
            Conversemos
          </h1>
          <p className="text-lg lg:text-[20px] font-normal text-slate-300 leading-relaxed max-w-[480px]">
            Si tienes una consulta, una propuesta o quieres conocer más sobre LUMINUS, puedes escribirnos. Nuestro equipo se pondrá en contacto contigo.
          </p>
        </div>

        {/* Right Column: Black 50% with Contact Form */}
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 bg-black flex flex-col justify-start">
          {submitted ? (
            <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col gap-4 items-center text-center border border-zinc-800 max-w-[480px] mx-auto w-full">
              <div className="text-3xl">✅</div>
              <h2 className="text-xl font-normal text-white">¡Gracias por escribirnos!</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tu mensaje ha sido recibido con éxito. Nuestro equipo se pondrá en contacto contigo a la brevedad.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-6 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-[480px] mx-auto flex flex-col gap-3.5">

              {/* Nombre y Apellido (2 Columnas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="nombre" className="text-xs font-medium text-slate-300">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="apellido" className="text-xs font-medium text-slate-300">
                    Apellido <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Correo electrónico */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs font-medium text-slate-300">
                  Correo electrónico <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-12 px-5 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors placeholder:text-slate-400"
                />
              </div>

              {/* Teléfono con código de país selector */}
              <div className="flex flex-col gap-1">
                <label htmlFor="telefono" className="text-xs font-medium text-slate-300">
                  Teléfono
                </label>
                <PhoneInput
                  value={form.telefono}
                  onChange={(val) => setForm((prev) => ({ ...prev, telefono: val }))}
                  phoneCountry={phoneCountry}
                  onCountryChange={(c) => setPhoneCountry(c)}
                  placeholder="Teléfono"
                />
              </div>

              {/* Motivo de contacto */}
              <div className="flex flex-col gap-1">
                <label htmlFor="motivo" className="text-xs font-medium text-slate-300">
                  Motivo de contacto <span className="text-red-400">*</span>
                </label>
                <CustomSelect
                  options={MOTIVOS}
                  value={form.motivo}
                  onChange={(val) => setForm((prev) => ({ ...prev, motivo: val }))}
                  placeholder="Selecciona un motivo"
                  required
                />
              </div>

              {/* Mensaje */}
              <div className="flex flex-col gap-1">
                <label htmlFor="mensaje" className="text-xs font-medium text-slate-300">
                  Mensaje <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  rows={3}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  value={form.mensaje}
                  onChange={handleChange}
                  className="w-full p-4 text-base font-normal text-slate-900 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none placeholder:text-slate-400"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-1 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-medium text-base rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  "Enviar mensaje"
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
