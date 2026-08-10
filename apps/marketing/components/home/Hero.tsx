export function Hero() {
  return (
    <section className="relative w-full py-20 lg:py-28 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_0%,#ffffff_100%),linear-gradient(90deg,#FF7700_0%,#E855C8_33%,#0450FB_66%,#A8C800_100%)]">
      <div className="max-w-[960px] mx-auto px-6 text-center flex flex-col items-center gap-8 lg:gap-10 relative z-10">

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-normal tracking-tight text-black leading-[1.18] max-w-[860px]">
          Un espacio para conectar,<br className="hidden sm:inline" /> aprender y cuidar tu bienestar
        </h1>

        {/* Subtitle */}
        <p className="w-full text-xl sm:text-2xl font-normal text-slate-900 leading-8">
          LUMINUS es una plataforma de bienestar que conecta personas, especialistas y espacios de toda Latinoamérica en una misma comunidad.
        </p>


        {/* CTA Container */}
        <div className="flex flex-col items-center gap-4 w-full pt-2">
          <a
            href="https://app.luminus.lat/auth"
            className="py-3.5 px-8 text-base font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center min-w-[240px] transition-colors"
          >
            Crear mi cuenta gratis
          </a>
          <div className="text-xs sm:text-sm text-black leading-relaxed flex flex-col gap-0.5 font-normal">
            <p>
              Empieza con <span className="font-bold">3 meses de acceso sin costo</span>.
            </p>
            <p>No se solicitan datos de pago al registrarte.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
