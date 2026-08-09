export function Hero() {
  return (
    <section className="relative w-full py-16 md:py-24 lg:py-28 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_0%,#ffffff_100%),linear-gradient(90deg,#FF7700_0%,#E855C8_33%,#0450FB_66%,#A8C800_100%)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-8 md:gap-10 relative z-10">
        
        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-black leading-[1.15] max-w-4xl">
          Un espacio para conectar, aprender y cuidar tu bienestar
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl font-normal text-black leading-relaxed max-w-3xl">
          LUMINUS es una plataforma de bienestar que conecta personas, especialistas y espacios de toda Latinoamérica en una misma comunidad.
        </p>

        {/* CTA Container */}
        <div className="flex flex-col items-center gap-4 w-full pt-2">
          <a
            href="https://app.luminus.lat/auth"
            className="w-full max-w-[320px] py-3.5 px-6 text-base font-normal text-white bg-black hover:bg-slate-800 rounded-2xl text-center"
          >
            Crear mi cuenta gratis
          </a>
          <p className="text-xs sm:text-sm text-black max-w-md leading-relaxed">
            Empieza con <span className="font-bold">3 meses de acceso sin costo</span>. No se solicitan datos de pago al registrarte.
          </p>
        </div>

      </div>
    </section>
  );
}
