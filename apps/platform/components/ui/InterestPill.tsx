import React from 'react';
import { INTEREST_CATEGORIES, ADMIN_COMMUNITY_CATEGORIES } from '@/utils/constants';

export type WellnessCategoryKey =
  | 'crecimiento'
  | 'emocional'
  | 'salud'
  | 'movimiento'
  | 'nutricion'
  | 'espiritualidad'
  | 'vinculos'
  | 'terapias'
  | 'slate';

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

const CATEGORY_TITLE_TO_KEY: Record<string, WellnessCategoryKey> = {
  'crecimiento personal': 'crecimiento',
  'bienestar emocional': 'emocional',
  'salud integral': 'salud',
  'movimiento físico': 'movimiento',
  'movimiento fisico': 'movimiento',
  'nutrición': 'nutricion',
  'nutricion': 'nutricion',
  'espiritualidad': 'espiritualidad',
  'vínculos': 'vinculos',
  'vinculos': 'vinculos',
  'vínculos y relaciones': 'vinculos',
  'vinculos y relaciones': 'vinculos',
  'terapias complementarias': 'terapias',
};

const PILL_CLASS_BY_KEY: Record<WellnessCategoryKey, string> = {
  crecimiento: 'category-pill-crecimiento',
  emocional: 'category-pill-emocional',
  salud: 'category-pill-salud',
  movimiento: 'category-pill-movimiento',
  nutricion: 'category-pill-nutricion',
  espiritualidad: 'category-pill-espiritualidad',
  vinculos: 'category-pill-vinculos',
  terapias: 'category-pill-terapias',
  slate: 'category-pill-slate',
};

const TEXT_CLASS_BY_KEY: Record<WellnessCategoryKey, string> = {
  crecimiento: 'category-text-crecimiento',
  emocional: 'category-text-emocional',
  salud: 'category-text-salud',
  movimiento: 'category-text-movimiento',
  nutricion: 'category-text-nutricion',
  espiritualidad: 'category-text-espiritualidad',
  vinculos: 'category-text-vinculos',
  terapias: 'category-text-terapias',
  slate: 'category-text-slate',
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

export function resolveWellnessCategoryKey(
  interestOrCategory?: string | null,
  customCategories?: any[]
): WellnessCategoryKey {
  if (!interestOrCategory) return 'slate';
  const normalized = interestOrCategory.trim().toLowerCase();

  if (CATEGORY_TITLE_TO_KEY[normalized]) {
    return CATEGORY_TITLE_TO_KEY[normalized];
  }

  const baseCategories = customCategories && customCategories.length > 0 ? customCategories : INTEREST_CATEGORIES;
  const categoriesToSearch = [...baseCategories, ...ADMIN_COMMUNITY_CATEGORIES];

  let matchedCategory = categoriesToSearch.find((cat: any) =>
    cat.title?.toLowerCase() === normalized ||
    (cat.items || []).some((item: string) => item.toLowerCase() === normalized)
  );

  if (!matchedCategory) {
    matchedCategory = categoriesToSearch.find((cat: any) => {
      const legacyItems = LEGACY_CATEGORY_MAP[cat.title] || [];
      return legacyItems.some((item: string) => item.toLowerCase() === normalized);
    });
  }

  if (matchedCategory?.title) {
    const titleNorm = matchedCategory.title.trim().toLowerCase();
    if (CATEGORY_TITLE_TO_KEY[titleNorm]) {
      return CATEGORY_TITLE_TO_KEY[titleNorm];
    }
  }

  if (normalized.includes('crecimiento')) return 'crecimiento';
  if (normalized.includes('emocional') || normalized.includes('psico')) return 'emocional';
  if (normalized.includes('salud') || normalized.includes('medic')) return 'salud';
  if (normalized.includes('movimiento') || normalized.includes('físic') || normalized.includes('fisic')) return 'movimiento';
  if (normalized.includes('nutrici')) return 'nutricion';
  if (normalized.includes('espiritual') || normalized.includes('meditac')) return 'espiritualidad';
  if (normalized.includes('vínculo') || normalized.includes('vinculo') || normalized.includes('relac')) return 'vinculos';
  if (normalized.includes('terapia') || normalized.includes('holíst') || normalized.includes('holist')) return 'terapias';

  return 'slate';
}

export function getCategoryPillClass(interestOrCategory?: string | null, customCategories?: any[]): string {
  const key = resolveWellnessCategoryKey(interestOrCategory, customCategories);
  return PILL_CLASS_BY_KEY[key];
}

export function getCategoryTextClass(interestOrCategory?: string | null, customCategories?: any[]): string {
  const key = resolveWellnessCategoryKey(interestOrCategory, customCategories);
  return TEXT_CLASS_BY_KEY[key];
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

  const pillTokenClass = getCategoryPillClass(interest, dbCategories);
  const heightClass = size === 'sm' ? 'h-7 px-2.5' : 'h-8.5 px-3.5';
  const textClass = size === 'sm' ? 'text-meta' : 'text-xs';

  return (
    <div
      className={`${heightClass} ${pillTokenClass} rounded-full border flex justify-center items-center transition-all hover:brightness-95 shrink-0 ${className}`}
    >
      <span className={`${textClass} font-medium text-center line-clamp-1 truncate font-sans select-none text-current`}>
        {interest}
      </span>
    </div>
  );
};

export default InterestPill;
