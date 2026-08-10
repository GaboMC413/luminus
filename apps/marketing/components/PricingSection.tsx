const PRICING_FEATURES = [
  "Acceso a la comunidad",
  "Perfiles e intereses de otros miembros",
  "Exploración de especialistas",
  "Sesiones introductorias con especialistas",
  "Actividades, entrevistas y novedades",
  "Espacios de bienestar y mapa (Próximamente)",
  "Grupos tematicos de conversación (Próximamente)",
  "Faro AI, tu asistente de orientación (Próximamente)",
];

export function PricingSection() {
  return (
    <section id="pricing" className="w-full py-16 md:py-24 bg-gradient-to-l from-slate-100/80 via-slate-50 to-white flex justify-center items-center">
      <div className="max-w-[1440px] w-full px-4 md:px-10 flex flex-col justify-end items-center gap-8">
        
        {/* Header */}
        <div className="w-full max-w-[960px] flex flex-col justify-start items-center gap-6 text-center">
          <h2 className="w-full text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900 leading-[48px]">
            Forma parte de LUMINUS
          </h2>
          <p className="w-full text-xl sm:text-2xl font-normal text-slate-900 leading-8">
            Accede a la comunidad, descubre nuevas formas de cuidar tu bienestar y aprovecha todas las herramientas que nuestra plataforma pone a tu alcance.
          </p>
          <p className="w-full text-base sm:text-lg font-normal text-slate-800 leading-6">
            Empieza con 3 meses sin costo y sin ingresar datos de pago.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-4">
          
          {/* Card 1: Membresía Mensual */}
          <div className="p-8 bg-white rounded-2xl flex flex-col justify-between items-start gap-6 border border-slate-200/80 shadow-sm">
            <div className="w-full flex flex-col justify-start items-start gap-4">
              
              {/* Badge */}
              <div className="px-3 py-1 bg-black rounded-2xl inline-flex justify-center items-center gap-2.5">
                <span className="text-white text-xs font-medium uppercase leading-5 tracking-wider">
                  Membresía Mensual
                </span>
              </div>

              {/* Pricing Details */}
              <div className="w-full flex flex-col justify-start items-start gap-2">
                <div className="text-slate-900 text-4xl font-bold leading-[48px]">
                  USD 5 / mes
                </div>
                <div className="text-slate-900 text-lg font-bold leading-6">
                  Luego de tus primeros 3 meses sin costo.
                </div>
                <div className="text-slate-900 text-lg font-normal leading-6">
                  Para quienes prefieren la flexibilidad de continuar mes a mes.
                </div>
              </div>

            </div>

            <hr className="w-full border-t border-gray-200 my-1" />

            {/* Features List */}
            <div className="w-full flex flex-col justify-start items-start gap-2.5">
              <div className="text-slate-900 text-base font-normal leading-6">
                Incluye:
              </div>
              {PRICING_FEATURES.map((feat, index) => (
                <div key={index} className="w-full inline-flex justify-start items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="flex-1 text-slate-900 text-base font-normal leading-6">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <hr className="w-full border-t border-gray-200 my-1" />

            {/* CTA & Sub-disclaimer */}
            <div className="w-full flex flex-col justify-start items-start gap-4 pt-2">
              <a
                href="https://app.luminus.lat/auth"
                className="w-full px-6 py-3.5 bg-black hover:bg-slate-800 rounded-2xl flex justify-center items-center text-white text-base font-normal leading-6 transition-colors"
              >
                Comenzar 3 meses gratis
              </a>
              <div className="text-slate-700 text-sm font-normal leading-5">
                Tus primeros 3 meses son sin costo. No solicitamos datos de pago al crear tu cuenta y te avisaremos antes de que finalice este período para que puedas decidir si quieres continuar.
              </div>
            </div>

          </div>

          {/* Card 2: Membresía Anual */}
          <div className="p-8 bg-white rounded-2xl flex flex-col justify-between items-start gap-6 border border-slate-200/80 shadow-sm">
            <div className="w-full flex flex-col justify-start items-start gap-4">
              
              {/* Header Badge & Discount */}
              <div className="w-full inline-flex justify-between items-center">
                <div className="px-3 py-1 bg-black rounded-2xl flex justify-center items-center gap-2.5">
                  <span className="text-white text-xs font-medium uppercase leading-5 tracking-wider">
                    Membresía Anual
                  </span>
                </div>
                <div className="text-slate-900 text-xs font-bold uppercase leading-5 tracking-wider">
                  25% de descuento
                </div>
              </div>

              {/* Pricing Details */}
              <div className="w-full flex flex-col justify-start items-start gap-2">
                <div className="text-slate-900 text-4xl font-bold leading-[48px]">
                  USD 45 / año
                </div>
                <div className="text-slate-900 text-lg font-bold leading-6">
                  Luego de tus primeros 3 meses sin costo.
                </div>
                <div className="text-slate-900 text-lg font-normal leading-6">
                  Para quienes quieren ahorrar frente al plan mensual. <span className="font-normal">(USD 3,75 / mes)</span>
                </div>
              </div>

            </div>

            <hr className="w-full border-t border-gray-200 my-1" />

            {/* Features List */}
            <div className="w-full flex flex-col justify-start items-start gap-2.5">
              <div className="text-slate-900 text-base font-normal leading-6">
                Incluye:
              </div>
              {PRICING_FEATURES.map((feat, index) => (
                <div key={index} className="w-full inline-flex justify-start items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="flex-1 text-slate-900 text-base font-normal leading-6">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <hr className="w-full border-t border-gray-200 my-1" />

            {/* CTA & Sub-disclaimer */}
            <div className="w-full flex flex-col justify-start items-start gap-4 pt-2">
              <a
                href="https://app.luminus.lat/auth"
                className="w-full px-6 py-3.5 bg-black hover:bg-slate-800 rounded-2xl flex justify-center items-center text-white text-base font-normal leading-6 transition-colors"
              >
                Comenzar 3 meses gratis
              </a>
              <div className="text-slate-700 text-sm font-normal leading-5">
                Tus primeros 3 meses son sin costo. No solicitamos datos de pago al crear tu cuenta y te avisaremos antes de que finalice este período para que puedas decidir si quieres continuar.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
