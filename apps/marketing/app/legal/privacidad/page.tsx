"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-[42px] font-jakarta font-normal tracking-tight leading-tight mb-4">Política de Privacidad</h1>
        <p className="text-zinc-500 text-[14px] mb-12">Última actualización: 18 de Abril, 2026</p>

        <section className="space-y-10 text-[16px] leading-[1.6]">
          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">1. Información que Recopilamos</h2>
            <p>
              En LUMINUS LATAM, recopilamos información necesaria para proporcionar una experiencia de red profesional personalizada. Esto incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700">
              <li>Datos de registro: Nombre, correo electrónico, contraseña.</li>
              <li>Perfil profesional: Cargo, industria, ubicación y enlaces a redes profesionales.</li>
              <li>Intereses: Áreas de especialización y temas de interés dentro de la comunidad.</li>
              <li>Datos de navegación: Información técnica sobre cómo interactúa con nuestra plataforma.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">2. Uso de sus Datos</h2>
            <p>
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700">
              <li>Facilitar conexiones inteligentes entre miembros de la comunidad.</li>
              <li>Personalizar el contenido y las recomendaciones que se le presentan.</li>
              <li>Enviar comunicaciones relacionadas con el servicio, actualizaciones y seguridad.</li>
              <li>Generar métricas agregadas y anónimas sobre tendencias en el sector tecnológico regional (LUMINUS Insights).</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">3. Cómo Compartimos la Información</h2>
            <p>
              Su privacidad es nuestra prioridad. No vendemos su información personal a terceros. Sus datos son visibles para otros miembros de la comunidad según la configuración de privacidad de su perfil. Podemos compartir datos con proveedores de servicios que nos ayudan a operar la plataforma (ej. bases de datos, analítica, servicios de email) bajo estrictos acuerdos de confidencialidad.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">4. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra acceso no autorizado, alteración o destrucción. Esto incluye cifrado de datos en tránsito y en reposo, así como auditorías periódicas de seguridad.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento. Puede gestionar la mayoría de su información directamente desde su perfil o contactando a nuestro equipo de soporte para solicitudes específicas de portabilidad o eliminación de cuenta.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">6. Cookies</h2>
            <p>
              Utilizamos cookies para mantener su sesión activa y comprender el uso de nuestro sitio. Puede configurar su navegador para rechazar cookies, aunque esto podría limitar algunas funcionalidades de LUMINUS.
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
