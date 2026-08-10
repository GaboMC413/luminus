"use client";

import { useState } from "react";

const MOTIVOS = [
  { value: "", label: "Selecciona un motivo" },
  { value: "usuario", label: "Soy un usuario de LUMINUS" },
  { value: "especialista", label: "Soy un especialista" },
  { value: "prensa", label: "Prensa y medios" },
  { value: "empresas", label: "Empresas aliadas" },
  { value: "otro", label: "Otro" },
];

export function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    motivo: "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Front-end only: compose mailto link
    const subject = encodeURIComponent(
      `[LUMINUS Contacto] ${MOTIVOS.find((m) => m.value === form.motivo)?.label ?? form.motivo}`
    );
    const body = encodeURIComponent(
      `Nombre: ${form.nombre}\nEmail: ${form.email}\nMotivo: ${MOTIVOS.find((m) => m.value === form.motivo)?.label ?? form.motivo}\n\nMensaje:\n${form.mensaje}`
    );
    window.location.href = `mailto:hola@luminus.lat?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <section className="w-full bg-[#f8f9fa] py-16 md:py-24">
      <div className="max-w-[680px] mx-auto px-4 md:px-6">

        {submitted ? (
          <div className="bg-white rounded-3xl p-10 flex flex-col gap-4 items-center text-center shadow-sm border border-zinc-100">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-normal text-slate-900">¡Gracias por escribirnos!</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Tu cliente de correo debería haberse abierto con tu mensaje listo para enviar a{" "}
              <a href="mailto:hola@luminus.lat" className="text-black underline">hola@luminus.lat</a>.
              Si no se abrió, puedes escribirnos directamente a esa dirección.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-sm text-slate-500 underline hover:text-black transition-colors"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-10 flex flex-col gap-8 shadow-sm border border-zinc-100">

            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
                Formulario de contacto
              </h2>
              <p className="text-base text-slate-500 leading-relaxed">
                Completa el formulario y nos pondremos en contacto contigo.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="reg-input-bordered"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="reg-input-bordered"
                />
              </div>

              {/* Motivo */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="motivo" className="text-sm font-medium text-slate-700">
                  Motivo de contacto <span className="text-red-500">*</span>
                </label>
                <select
                  id="motivo"
                  name="motivo"
                  required
                  value={form.motivo}
                  onChange={handleChange}
                  className="reg-input-bordered appearance-none bg-white"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m.value} value={m.value} disabled={m.value === ""}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mensaje */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mensaje" className="text-sm font-medium text-slate-700">
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  value={form.mensaje}
                  onChange={handleChange}
                  className="reg-input-textarea"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-pill-primary w-full sm:w-auto min-w-[200px] text-base font-normal rounded-2xl h-12 px-8"
                >
                  Enviar mensaje
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Al enviar este formulario, aceptas que LUMINUS utilice la información proporcionada para responder a tu consulta.
              </p>

            </form>
          </div>
        )}

      </div>
    </section>
  );
}
