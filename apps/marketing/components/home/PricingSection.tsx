const PRICING_FEATURES = [
  "Acceso a la comunidad",
  "Perfiles e intereses de otros miembros",
  "Exploración de especialistas",
  "Sesiones introductorias con especialistas",
  "Actividades, entrevistas y novedades",
  "Espacios de bienestar (Próximamente)",
  "Grupos tematicos de conversación (Próximamente)",
  "Faro AI, tu asistente de orientación (Próximamente)",
];

export function PricingSection() {
  return (
    <section id="pricing" className="w-full py-16 md:py-24 flex justify-center items-center bg-[linear-gradient(0deg,rgba(255,255,255,0.75)_0%,#ffffff_100%),linear-gradient(90deg,#FF7700_0%,#E855C8_33%,#0450FB_66%,#A8C800_100%)]">
      <div className="max-w-[1440px] w-full px-4 md:px-10 flex flex-col justify-end items-center gap-8">

        {/* Header */}
        <div className="w-full max-w-[960px] flex flex-col justify-start items-center gap-6 text-center">
          <h2 className="w-full text-3xl sm:text-4xl lg:text-heading-3 font-normal tracking-tight text-slate-900">
            Únete gratis o impulsa la red como Mecenas
          </h2>

        </div>

        {/* Pricing Cards */}
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-4">

          {/* Card 1: Mecenas Mensual */}
          <div className="p-8 bg-white rounded-2xl flex flex-col justify-between items-start gap-6 border border-slate-200/80 shadow-sm">
            <div className="w-full flex flex-col justify-start items-start gap-4">

              {/* Badge */}
              <div className="px-3 py-1 bg-black rounded-2xl inline-flex justify-center items-center gap-2.5">
                <span className="text-white text-xs font-medium uppercase leading-5 tracking-wider">
                  Mecenas Mensual
                </span>
              </div>

              {/* Pricing Details */}
              <div className="w-full flex flex-col justify-start items-start gap-2">
                <div className="text-slate-900 text-4xl font-bold leading-[48px]">
                  USD 5 / mes
                </div>
                <div className="text-slate-900 text-lg font-bold leading-6">
                  Renovación automática. Cancela cuando quieras.
                </div>
                <div className="text-slate-900 text-lg font-normal leading-6">
                  Para quienes prefieren apoyar la red mes a mes con total flexibilidad.
                </div>
              </div>

            </div>

            {/* CTA & Sub-disclaimer */}
            <div className="w-full flex flex-col justify-start items-start gap-4 pt-2">
              <a
                href="https://app.luminuslatam.com/unirme"
                className="w-full px-6 py-3.5 bg-black hover:bg-slate-800 rounded-2xl flex justify-center items-center text-white text-base font-normal leading-6 transition-colors"
              >
                Ser Mecenas por USD 5/mes
              </a>

            </div>

          </div>

          {/* Card 2: Mecenas Anual */}
          <div className="p-8 bg-white rounded-2xl flex flex-col justify-between items-start gap-6 border border-slate-200/80 shadow-sm">
            <div className="w-full flex flex-col justify-start items-start gap-4">

              {/* Header Badge & Discount */}
              <div className="w-full inline-flex justify-between items-center">
                <div className="px-3 py-1 bg-black rounded-2xl flex justify-center items-center gap-2.5">
                  <span className="text-white text-xs font-medium uppercase leading-5 tracking-wider">
                    Mecenas Anual
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
                  Ahorra USD 15 al año. Cancela cuando quieras.
                </div>
                <div className="text-slate-900 text-lg font-normal leading-6">
                  Una bonificación para quienes prefieren hacer un aporte anual. <span className="font-normal">(USD 3,75 / mes)</span>
                </div>
              </div>

            </div>

            {/* CTA & Sub-disclaimer */}
            <div className="w-full flex flex-col justify-start items-start gap-4 pt-2">
              <a
                href="https://app.luminuslatam.com/unirme"
                className="w-full px-6 py-3.5 bg-black hover:bg-slate-800 rounded-2xl flex justify-center items-center text-white text-base font-normal leading-6 transition-colors"
              >
                Ser Mecenas por USD 45/año
              </a>

            </div>

          </div>

        </div>
        <div className="w-full max-w-[800px] flex flex-col justify-start items-center gap-6 text-center">
          <p className="w-full text-body-medium font-normal text-slate-900 leading-relaxed">
            También puedes unirte gratis sin ingresar datos de pago. Siendo Mecenas, impulsas el desarrollo de nuevas herramientas y experiencias acercando el bienestar a cada vez más personas en Latinoamérica.
          </p>
        </div>

      </div>
    </section>
  );
}
