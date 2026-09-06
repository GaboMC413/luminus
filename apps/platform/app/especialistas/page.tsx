"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";

type Specialist = {
  id: string;
  name: string;
  avatar: string;
  city: string;
  country: string;
  specialty: string;
};

type ApplicationStatus = {
  hasApplication: boolean;
  status: string | null;
};

function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const location = [specialist.city, specialist.country].filter(Boolean).join(", ");

  return (
    <article
      className="group flex min-h-[220px] cursor-pointer flex-col items-center rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center transition-colors hover:border-slate-400"
      onClick={() => {
        router.push(`/comunidad/public-profile?id=${encodeURIComponent(specialist.id)}`);
      }}
    >
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:h-20 sm:w-20">
        {specialist.avatar && !imageError ? (
          <img
            src={specialist.avatar}
            alt={specialist.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="material-symbols-outlined text-[42px] text-slate-300">person</span>
        )}
      </div>

      <h2 className="mt-3 line-clamp-1 text-sm font-semibold text-slate-950 sm:text-base">
        {specialist.name}
      </h2>
      <p className="mt-1 line-clamp-1 min-h-5 text-xs text-slate-500 sm:text-sm">
        {location || "Ubicación no especificada"}
      </p>
      <p className="mt-3 line-clamp-2 font-jakarta text-sm font-bold text-fuchsia-500">
        {specialist.specialty}
      </p>
      <span className="mt-auto pt-3 text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-900">
        Ver especialista
      </span>
    </article>
  );
}

export default function EspecialistasPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/especialistas", { cache: "no-store" }),
      fetch("/api/especialistas/application-status", { cache: "no-store" }),
    ])
      .then(async ([directoryResponse, statusResponse]) => {
        if (!directoryResponse.ok) throw new Error("No pudimos cargar los especialistas.");
        const directory = await directoryResponse.json();
        setSpecialists(directory.specialists || []);
        if (statusResponse.ok) setApplication(await statusResponse.json());
      })
      .catch((err) => setError(err.message || "No pudimos cargar los especialistas."))
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(
    () => Array.from(new Set(specialists.map((item) => item.country).filter(Boolean))).sort(),
    [specialists],
  );
  const specialties = useMemo(
    () => Array.from(new Set(specialists.map((item) => item.specialty).filter(Boolean))).sort(),
    [specialists],
  );

  const visibleSpecialists = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return specialists.filter((item) => {
      const matchesQuery = !normalizedQuery || [item.name, item.city, item.country, item.specialty]
        .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery));
      return matchesQuery && (!country || item.country === country) && (!specialty || item.specialty === specialty);
    });
  }, [specialists, query, country, specialty]);

  const hasFilters = Boolean(country || specialty);
  const isPending = application?.status === "pending_review";

  if (loading) return <PageLoader className="min-h-[70vh]" />;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-3 pb-8 pt-4 font-sans sm:px-6 md:gap-6 md:py-6">
      {isPending && (
        <section className="order-[-3] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <strong>Tu aplicación está en revisión.</strong>{" "}
          <button className="underline" onClick={() => router.push("/especialistas/onboarding")}>Ver estado</button>
        </section>
      )}

      <div className="order-[-2] relative flex items-center gap-2">
        <span className="material-symbols-outlined pointer-events-none absolute left-4 text-[21px] text-slate-500">search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar especialistas"
          className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-slate-500"
        />
        <button
          type="button"
          aria-label="Mostrar filtros"
          onClick={() => setShowFilters((current) => !current)}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white transition ${showFilters || hasFilters ? "border-slate-700 text-slate-950" : "border-slate-300 text-slate-600"}`}
        >
          <span className="material-symbols-outlined">tune</span>
          {hasFilters && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />}
        </button>
      </div>

      {showFilters && (
        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            País
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800">
              <option value="">Todos los países</option>
              {countries.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Especialidad
            <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800">
              <option value="">Todas las especialidades</option>
              {specialties.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {hasFilters && (
            <button type="button" onClick={() => { setCountry(""); setSpecialty(""); }} className="justify-self-start text-xs font-semibold text-slate-600 underline sm:col-span-2">
              Limpiar filtros
            </button>
          )}
        </section>
      )}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>
      ) : visibleSpecialists.length ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {visibleSpecialists.map((specialist) => <SpecialistCard key={specialist.id} specialist={specialist} />)}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">person_search</span>
          <h2 className="mt-2 font-semibold text-slate-900">No encontramos especialistas</h2>
          <p className="mt-1 text-sm text-slate-500">Prueba con otra búsqueda o limpia los filtros.</p>
        </section>
      )}

      {!application?.hasApplication && (
        <section className="relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-wellness-sage-100/10 via-white to-wellness-clay-100/20 p-5 md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-wellness-sage-200/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-wellness-clay-200/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-1 flex-col gap-5">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-500">¿Eres un especialista en bienestar?</span>
              <h2 className="font-jakarta text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
                Haz visible tu forma de acompañar
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                LUMINUS reúne a personas que están explorando bienestar, cambio personal, salud integral y nuevas formas de vivir con más conciencia. Tu lugar como especialista no es solo aparecer en una lista, sino ayudar a que más personas encuentren orientación clara, humana y confiable.
              </p>
            </div>

            <div className="flex items-stretch gap-3">
              <div className="luminus-gradient w-[2px] shrink-0 rounded-full" />
              <p className="font-jakarta text-[13px] font-medium italic text-slate-500">
                “Un espacio para mostrar quién eres, cómo trabajas y qué puedes aportar.”
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => router.push("/especialistas/onboarding")}
                className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-900 sm:w-auto"
              >
                Aplicar como Especialista
              </button>
              <a
                href="https://luminuslatam.com/especialistas"
                target="_blank"
                rel="noopener noreferrer"
                className="font-jakarta text-[13px] font-semibold text-slate-500 underline underline-offset-4 transition-colors hover:text-black"
              >
                Ver más acerca del programa
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
