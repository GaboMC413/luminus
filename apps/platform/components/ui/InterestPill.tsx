import React from 'react';
import { INTEREST_CATEGORIES } from '@/utils/constants';

interface InterestPillProps {
  interest: string;
  className?: string;
  size?: 'sm' | 'md';
}

const LEGACY_CATEGORY_MAP: Record<string, string[]> = {
  'Crecimiento Personal': ['Propósito de vida', 'Cambios de vida', 'Motivación', 'Toma de decisiones', 'Confianza personal', 'Aprendizaje continuo', 'Hábitos conscientes', 'Organización personal', 'Balance vida personal', 'Rutinas saludables', 'Calidad de vida'],
  'Bienestar Emocional': ['Bienestar emocional', 'Equilibrio emocional', 'Calma interior', 'Acompañamiento personal', 'Gestión emocional', 'Relaciones saludables', 'Comunicación consciente'],
  'Salud Integral': ['Salud y Medicina', 'Bienestar físico', 'Dolor crónico', 'Manejo del dolor', 'Recuperación', 'Alergias', 'Inmunidad', 'Peso saludable', 'Salud cardiovascular', 'Salud metabólica', 'Salud sexual', 'Fertilidad', 'Embarazo'],
  'Movimiento Físico': ['Cuidado del cuerpo', 'Entrenamiento funcional', 'Postura y movilidad', 'Fuerza', 'Masa muscular', 'Resistencia', 'Movimiento consciente', 'Cardio', 'Yoga y Pilates'],
  'Nutrición': ['Alimentación saludable', 'Nutrición diaria', 'Cocina práctica', 'Vitaminas', 'Hidratación'],
  'Espiritualidad': ['Espiritualidad y Conexión', 'Atención plena', 'Conexión interior', 'Experiencias conscientes'],
  'Vínculos': ['Estilo de Vida', 'Sustentabilidad', 'Descanso', 'Sueño reparador']
};

let cachedCategories: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;

function getCategoriesAsync(): Promise<any[]> {
  if (cachedCategories) return Promise.resolve(cachedCategories);
  if (!fetchPromise) {
    fetchPromise = fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => {
        const cats = (data.categories || []) as any[];
        cachedCategories = cats;
        return cats;
      })
      .catch(() => [] as any[]);
  }
  return fetchPromise;
}

export const InterestPill = ({ interest, className = "", size = "md" }: InterestPillProps) => {
  const [dbCategories, setDbCategories] = React.useState<any[]>(cachedCategories || []);

  React.useEffect(() => {
    if (!cachedCategories) {
      getCategoriesAsync().then((cats) => {
        if (cats && cats.length > 0) {
          setDbCategories(cats);
        }
      });
    }
  }, []);

  const categoriesToSearch = dbCategories.length > 0 ? dbCategories : INTEREST_CATEGORIES;

  // Find the category for this interest to get the consistent style
  let category = categoriesToSearch.find((cat: any) =>
    (cat.items || []).some((item: string) => item.toLowerCase() === interest.toLowerCase())
  );

  if (!category) {
    category = categoriesToSearch.find((cat: any) => {
      const legacyItems = LEGACY_CATEGORY_MAP[cat.title] || [];
      return legacyItems.some((item: string) => item.toLowerCase() === interest.toLowerCase());
    });
  }

  const color = category ? category.color : '#94A3B8'; // Default slate-400
  const bgColor = category?.bgColor || `${color}10`;

  const heightClass = size === 'sm' ? 'h-7 px-2.5' : 'h-9 px-4';
  const textClass = size === 'sm' ? 'text-[11px]' : 'text-[12px] md:text-[14px]';

  return (
    <div 
      className={`${heightClass} rounded-full border flex justify-center items-center transition-all hover:brightness-95 shrink-0 ${className}`}
      style={{
        backgroundColor: bgColor,
        color: color,
        borderColor: `${color}40`  // ~25% opacity for border
      }}
    >
      <span className={`${textClass} font-medium text-center line-clamp-1 truncate font-sans select-none`}>
        {interest}
      </span>
    </div>
  );
};

export default InterestPill;
