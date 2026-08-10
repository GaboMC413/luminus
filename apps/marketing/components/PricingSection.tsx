const PRICING_FEATURES = [
  "Acceso a la comunidad",
  "Perfiles e intereses de otros miembros",
  "Exploración de especialistas",
  "Sesiones introductorias con especialistas",
  "Actividades, entrevistas y novedades",
  "Espacios de bienestar (Próximamente)",
  "Grupos temáticos de conversación (Próximamente)",
  "Faro AI, tu asistente de orientación (Próximamente)",
];

export function PricingSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,#ffffff_100%),linear-gradient(270deg,#ffcfa6_0%,#f7c3ec_33%,#a7c2fe_66%,#e1eca6_100%)] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-12 items-center">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900">
            Forma parte de LUMINUS
          </h2>
          <p className="text-lg sm:text-heading-6 font-normal text-slate-800 max-w-[860px]">
            Accede a la comunidad, descubre nuevas formas de cuidar tu bienestar y aprovecha todas las herramientas que nuestra plataforma pone a tu alcance.
          </p>
          <p className="text-body-large font-normal text-slate-700">
            Empieza con 3 meses sin costo y sin ingresar datos de pago.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1040px] items-stretch">
          
          {/* Card 1: Monthly */}
          <div className="bg-white rounded-3xl p-8 md:p-10 flex flex-col justify-between gap-8 border border-slate-200">
            
            <div className="flex flex-col gap-6">
              {/* Header Badge & Price */}
              <div className="flex flex-col gap-3">
                <span className="self-start px-3.5 py-1 bg-black text-white text-body-xs font-medium rounded-full uppercase tracking-wider">
                  Membresía Mensual
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-4xl lg:text-heading-3 font-bold text-slate-900">
                    USD 5 <span className="text-body-large font-normal text-slate-600">/ mes</span>
                  </h3>
                  <p className="text-body-large font-bold text-slate-800 pt-1">
                    Luego de tus primeros 3 meses sin costo.
                  </p>
                  <p className="text-body-large font-normal text-slate-600">
                    Para quienes prefieren la flexibilidad de continuar mes a mes.
                  </p>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Features List */}
              <div className="flex flex-col gap-3">
                <p className="text-body-medium font-normal text-slate-900 uppercase tracking-wider">
                  Incluye:
                </p>
                <ul className="flex flex-col gap-2.5">
                  {PRICING_FEATURES.map((feat, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-body-medium text-slate-700 font-normal">
                      <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA & Disclaimer */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
              <a
                href="https://app.luminus.lat/auth"
                className="w-full py-4 text-center text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl"
              >
                Comenzar 3 meses gratis
              </a>
              <p className="text-body-small text-slate-500 italic leading-relaxed text-center font-normal">
                Tus primeros 3 meses son sin costo. No solicitamos datos de pago al crear tu cuenta y te avisaremos antes de que finalice este período.
              </p>
            </div>

          </div>

          {/* Card 2: Annual */}
          <div className="bg-white rounded-3xl p-8 md:p-10 flex flex-col justify-between gap-8 border-2 border-slate-900 relative">
            
            <div className="flex flex-col gap-6">
              {/* Header Badge & Price */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 bg-black text-white text-body-xs font-medium rounded-full uppercase tracking-wider">
                    Membresía Anual
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-body-xs font-bold rounded-full uppercase tracking-wider">
                    25% de descuento
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-4xl lg:text-heading-3 font-bold text-slate-900">
                    USD 45 <span className="text-body-large font-normal text-slate-600">/ año</span>
                  </h3>
                  <p className="text-body-large font-bold text-slate-800 pt-1">
                    Luego de tus primeros 3 meses sin costo.
                  </p>
                  <p className="text-body-large font-normal text-slate-600">
                    Para quienes quieren ahorrar frente al plan mensual. <span className="italic text-slate-700">(USD 3,75 / mes)</span>
                  </p>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Features List */}
              <div className="flex flex-col gap-3">
                <p className="text-body-medium font-normal text-slate-900 uppercase tracking-wider">
                  Incluye:
                </p>
                <ul className="flex flex-col gap-2.5">
                  {PRICING_FEATURES.map((feat, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-body-medium text-slate-700 font-normal">
                      <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA & Disclaimer */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
              <a
                href="https://app.luminus.lat/auth"
                className="w-full py-4 text-center text-body-medium font-normal text-white bg-black hover:bg-slate-800 rounded-2xl"
              >
                Comenzar 3 meses gratis
              </a>
              <p className="text-body-small text-slate-500 italic leading-relaxed text-center font-normal">
                Tus primeros 3 meses son sin costo. No solicitamos datos de pago al crear tu cuenta y te avisaremos antes de que finalice este período.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
