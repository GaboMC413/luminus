# Regla de Estandarización de Layouts y Espaciados en LUMINUS Marketing

## 1. Estructura de Contenedor de Página
Todas las páginas principales (Grabaciones, Próximas Fechas, Centro Legal, Especialistas, etc.) deben seguir de manera **MANDATORIA** la misma jerarquía de contenedores:

```tsx
<main className="w-full min-h-screen bg-white flex flex-col justify-between">
  <Navbar />
  <div className="w-full pt-[64px] flex-1 flex flex-col">
    <section className="w-full pt-8 md:pt-12 pb-8 md:pb-16 bg-white flex-1 flex flex-col">
      {/* Contenido de la página */}
    </section>
  </div>
  <Footer />
</main>
```

### Prohibiciones Estrictas:
- **NO** usar `justify-center` en el contenedor `<main>` o en la sección principal para evitar empujar los títulos hacia abajo de forma inconsistente.
- **NO** usar márgenes superiores arbitrarios (`py-6 md:py-10`) que alteren la distancia estándar entre el Navbar y el título principal.

---

## 2. Encabezado Estándar (Título y Subtítulo)
Los encabezados de sección deben usar exactamente los mismos estilos y márgenes:

```tsx
<div className="max-w-[1440px] mx-auto px-4 md:px-10 mb-6 md:mb-8 w-full">
  <div className="w-full flex flex-col justify-start items-start gap-3 md:gap-4 text-left">
    <h1 className="w-full text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
      {Título}
    </h1>
    <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-7 md:leading-8">
      {Subtítulo}
    </p>
  </div>
</div>
```

---

## 3. Grilla y Márgenes Horizontales
Todas las grillas y listas de tarjetas deben estar contenidas dentro del contenedor estándar de 1440px:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 max-w-[1440px] mx-auto px-4 md:px-10 w-full">
  {/* Cards */}
</div>
```

---

## 4. Fondos y Fondos de Sección
- El fondo base de las páginas es blanco (`bg-white`).
- Las cards sobre fondo blanco deben usar `bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors`.
