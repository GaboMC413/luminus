"use client";

import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[70px] md:h-[80px] bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 md:px-8 flex items-center justify-between z-50">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[18px] md:h-[20px]" />
        </Link>
        <Link 
          href="https://app.luminuslatam.com/auth/registrarse" 
          className="group flex items-center gap-2 text-[14px] font-medium border border-black px-4 md:px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all"
        >
          <span className="hidden md:inline">Volver al registro</span>
          <span className="material-symbols-rounded md:hidden text-[20px]">arrow_back</span>
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto pt-[110px] md:pt-[140px] pb-12 md:pb-24 px-8">
        <h1 className="text-[42px] font-jakarta font-normal tracking-tight leading-tight mb-4">Política de Cookies</h1>
        <p className="text-zinc-500 text-[14px] mb-12">Última actualización: 18 de Abril, 2026</p>

        <section className="space-y-10 text-[16px] leading-[1.6]">
          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su navegador cuando visita LUMINUS LATAM. Nos permiten recordar sus preferencias, mantener su sesión activa y comprender cómo utiliza nuestra plataforma para ofrecerle una experiencia más fluida y personalizada.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">2. Tipos de cookies que utilizamos</h2>
            <p>
              En LUMINUS, utilizamos los siguientes tipos de cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700">
              <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio, como el inicio de sesión y la seguridad.</li>
              <li><strong>Cookies de Preferencia:</strong> Permiten recordar información que cambia el aspecto o comportamiento del sitio, como su idioma preferido.</li>
              <li><strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo interactúan los visitantes con la plataforma al recopilar y reportar información de forma anónima.</li>
              <li><strong>Cookies Funcionales:</strong> Permiten ofrecer funcionalidades mejoradas y personalizadas, como la integración con servicios de terceros.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">3. Gestión de cookies</h2>
            <p>
              Usted tiene la libertad de aceptar o rechazar las cookies. La mayoría de los navegadores web aceptan cookies automáticamente, pero generalmente puede modificar la configuración de su navegador para rechazarlas si lo prefiere. Tenga en cuenta que, si decide rechazar las cookies, es posible que no pueda experimentar plenamente las funciones interactivas de LUMINUS.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">4. Cookies de Terceros</h2>
            <p>
              En algunos casos, también utilizamos cookies proporcionadas por terceros de confianza. Por ejemplo, utilizamos Google Analytics para ayudarnos a comprender cómo utiliza el sitio y cómo podemos mejorar su experiencia. Estas cookies pueden rastrear cosas como cuánto tiempo pasa en el sitio y las páginas que visita.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">5. Más información</h2>
            <p>
              Si desea obtener más información sobre cómo gestionamos sus datos, puede consultar nuestra Política de Privacidad. Si tiene alguna duda específica sobre nuestra Política de Cookies, puede contactarnos a través de nuestro centro de soporte.
            </p>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <div className="w-full shrink-0 h-[64px] flex flex-col justify-center border-t border-zinc-100 mt-auto">
        <p className="text-[9px] text-zinc-400 text-center uppercase tracking-wide">LUMINUS LATAM © 2026</p>
      </div>
    </div>
  );
}
