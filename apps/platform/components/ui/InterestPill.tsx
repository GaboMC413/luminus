"use client";

import React from 'react';
import {
  type LucideIcon,
  Sun,
  Smile,
  HeartPulse,
  Dumbbell,
  Apple,
  Sparkle,
  Blend,
  Flower,
  Brain,
  Leaf,
  Flame,
  Compass,
  Feather,
  Moon,
  Star,
  Users,
  Shield,
  Music,
  BookOpen,
  Globe,
  Tag,
} from 'lucide-react';
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

export interface CategoryIconOption {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { key: 'sun', label: 'Sol (Crecimiento)', Icon: Sun },
  { key: 'smile', label: 'Sonrisa (Emocional)', Icon: Smile },
  { key: 'heart-pulse', label: 'Pulso (Salud Integral)', Icon: HeartPulse },
  { key: 'dumbbell', label: 'Pesas (Movimiento)', Icon: Dumbbell },
  { key: 'apple', label: 'Manzana (Nutrición)', Icon: Apple },
  { key: 'sparkle', label: 'Destello (Espiritualidad)', Icon: Sparkle },
  { key: 'blend', label: 'Vínculos (Relaciones)', Icon: Blend },
  { key: 'flower', label: 'Flor (Terapias)', Icon: Flower },
  { key: 'brain', label: 'Mente', Icon: Brain },
  { key: 'leaf', label: 'Naturaleza', Icon: Leaf },
  { key: 'flame', label: 'Energía', Icon: Flame },
  { key: 'compass', label: 'Propósito', Icon: Compass },
  { key: 'feather', label: 'Calma', Icon: Feather },
  { key: 'moon', label: 'Descanso', Icon: Moon },
  { key: 'star', label: 'Estrella', Icon: Star },
  { key: 'users', label: 'Comunidad', Icon: Users },
  { key: 'shield', label: 'Protección', Icon: Shield },
  { key: 'music', label: 'Sonoterapia', Icon: Music },
  { key: 'book-open', label: 'Aprendizaje', Icon: BookOpen },
  { key: 'globe', label: 'Global', Icon: Globe },
  { key: 'tag', label: 'Etiqueta', Icon: Tag },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // Canonical Lucide keys
  'sun': Sun,
  'smile': Smile,
  'heart-pulse': HeartPulse,
  'heart_pulse': HeartPulse,
  'dumbbell': Dumbbell,
  'apple': Apple,
  'sparkle': Sparkle,
  'blend': Blend,
  'flower': Flower,
  'brain': Brain,
  'leaf': Leaf,
  'flame': Flame,
  'compass': Compass,
  'feather': Feather,
  'moon': Moon,
  'star': Star,
  'users': Users,
  'shield': Shield,
  'music': Music,
  'book-open': BookOpen,
  'globe': Globe,
  'tag': Tag,
  // Legacy Google Material Symbol aliases -> mapped to canonical Lucide icons
  'sunny': Sun,
  'mood': Smile,
  'stethoscope': HeartPulse,
  'ecg_heart': HeartPulse,
  'favorite': HeartPulse,
  'exercise': Dumbbell,
  'directions_run': Dumbbell,
  'fitness_center': Dumbbell,
  'nutrition': Apple,
  'self_improvement': Sparkle,
  'person_celebrate': Blend,
  'join_inner': Blend,
  'diversity_3': Blend,
  'spa': Flower,
  'local_florist': Flower,
  'label': Tag,
};

export const CANONICAL_COLOR_PRESETS = [
  { key: 'crecimiento', name: 'Ámbar (Crecimiento)', color: '#D97706', bgColor: '#FFFBEB' },
  { key: 'emocional', name: 'Rosa (Emocional)', color: '#DB2777', bgColor: '#FDF2F8' },
  { key: 'salud', name: 'Azul (Salud Integral)', color: '#2563EB', bgColor: '#EFF6FF' },
  { key: 'movimiento', name: 'Rojo (Movimiento)', color: '#DC2626', bgColor: '#FEF2F2' },
  { key: 'nutricion', name: 'Lima (Nutrición)', color: '#4D7C0F', bgColor: '#F7FEE7' },
  { key: 'espiritualidad', name: 'Violeta (Espiritualidad)', color: '#9333EA', bgColor: '#FAF5FF' },
  { key: 'vinculos', name: 'Naranja (Vínculos)', color: '#EA580C', bgColor: '#FFF7ED' },
  { key: 'terapias', name: 'Turquesa (Terapias)', color: '#0F766E', bgColor: '#F0FDFA' },
];

const DEFAULT_COLORS_BY_KEY: Record<WellnessCategoryKey, string[]> = {
  crecimiento: ['#B45309', '#F59E0B', '#D97706'],
  emocional: ['#BE185D', '#F472B6', '#EC4899', '#DB2777'],
  salud: ['#1D4ED8', '#2563EB', '#0450FB', '#3B82F6'],
  movimiento: ['#BE123C', '#EF4444', '#DC2626', '#E11D48'],
  nutricion: ['#4D7C0F', '#84CC16', '#65A30D'],
  espiritualidad: ['#7E22CE', '#6D28D9', '#9333EA'],
  vinculos: ['#C2410C', '#F97316', '#EA580C'],
  terapias: ['#0F766E', '#14B8A6', '#0D9488'],
  slate: ['#334155', '#475569', '#0F172A'],
};

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

export const CATEGORY_ICON_BY_KEY: Record<WellnessCategoryKey, LucideIcon> = {
  crecimiento: Sun,
  emocional: Smile,
  salud: HeartPulse,
  movimiento: Dumbbell,
  nutricion: Apple,
  espiritualidad: Sparkle,
  vinculos: Blend,
  terapias: Flower,
  slate: Tag,
};

let cachedCategories: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;
const cacheSubscribers = new Set<(cats: any[]) => void>();

export function invalidateCategoriesCache() {
  cachedCategories = null;
  fetchPromise = null;
  getCategoriesAsync(true).then((cats) => {
    cacheSubscribers.forEach((cb) => cb(cats));
  });
}

function getCategoriesAsync(force = false): Promise<any[]> {
  if (!force && cachedCategories) return Promise.resolve(cachedCategories);
  if (force || !fetchPromise) {
    fetchPromise = fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' })
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

export function useDynamicCategories(): any[] {
  const [dbCategories, setDbCategories] = React.useState<any[]>(cachedCategories || []);

  React.useEffect(() => {
    const handler = (cats: any[]) => setDbCategories(cats);
    cacheSubscribers.add(handler);
    if (!cachedCategories) {
      getCategoriesAsync().then((cats) => {
        if (cats && cats.length > 0) {
          setDbCategories(cats);
        }
      });
    }
    return () => {
      cacheSubscribers.delete(handler);
    };
  }, []);

  return dbCategories;
}

function normalizeStr(s?: string | null): string {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function findMatchedCategoryObject(
  interestOrCategory?: string | null,
  customCategories?: any[]
): any | null {
  if (!interestOrCategory) return null;
  const normalized = interestOrCategory.trim().toLowerCase();
  const normNoAccent = normalizeStr(interestOrCategory);

  const activeCustom =
    customCategories && customCategories.length > 0
      ? customCategories
      : cachedCategories && cachedCategories.length > 0
      ? cachedCategories
      : INTEREST_CATEGORIES;

  const categoriesToSearch = [...activeCustom, ...ADMIN_COMMUNITY_CATEGORIES];

  let matched = categoriesToSearch.find((cat: any) => {
    const catTitle = (cat.title || cat.name || '').trim().toLowerCase();
    const catTitleNoAccent = normalizeStr(catTitle);
    if (catTitle === normalized || catTitleNoAccent === normNoAccent) return true;
    if (
      (catTitleNoAccent.includes('vinculo') && normNoAccent.includes('vinculo')) ||
      (catTitleNoAccent.includes('movimiento') && normNoAccent.includes('movimiento'))
    ) {
      return true;
    }
    const items: string[] = Array.isArray(cat.items)
      ? cat.items
      : Array.isArray(cat.interests)
      ? cat.interests.map((i: any) => (typeof i === 'string' ? i : i.name))
      : [];
    const areas: string[] = Array.isArray(cat.specialistAreas)
      ? cat.specialistAreas.map((a: any) => (typeof a === 'string' ? a : a.name))
      : [];
    return (
      items.some((item: string) => normalizeStr(item) === normNoAccent) ||
      areas.some((area: string) => normalizeStr(area) === normNoAccent)
    );
  });

  if (!matched) {
    matched = categoriesToSearch.find((cat: any) => {
      const catTitle = cat.title || cat.name || '';
      const legacyItems = LEGACY_CATEGORY_MAP[catTitle] || [];
      return legacyItems.some((item: string) => normalizeStr(item) === normNoAccent);
    });
  }

  return matched || null;
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

  const matchedCategory = findMatchedCategoryObject(interestOrCategory, customCategories);

  if (matchedCategory) {
    const titleNorm = (matchedCategory.title || matchedCategory.name || '').trim().toLowerCase();
    if (CATEGORY_TITLE_TO_KEY[titleNorm]) {
      return CATEGORY_TITLE_TO_KEY[titleNorm];
    }
  }

  if (normalized.includes('crecimiento')) return 'crecimiento';
  if (normalized.includes('emocional') || normalized.includes('psico')) return 'emocional';
  if (normalized.includes('salud') || normalized.includes('integral') || normalized.includes('medic')) return 'salud';
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

export function getCategoryCustomStyles(
  interestOrCategory?: string | null,
  customCategories?: any[]
): { color?: string; bgColor?: string; borderColor?: string } | null {
  const matched = findMatchedCategoryObject(interestOrCategory, customCategories);
  if (matched && matched.color) {
    const key = resolveWellnessCategoryKey(matched.title || matched.name || interestOrCategory, customCategories);
    const upperColor = String(matched.color).trim().toUpperCase();
    const isDefaultForKey = (DEFAULT_COLORS_BY_KEY[key] || []).includes(upperColor);
    if (isDefaultForKey) {
      return null;
    }
    return {
      color: matched.color,
      bgColor: matched.bgColor || `${matched.color}18`,
      borderColor: `${matched.color}35`,
    };
  }
  return null;
}

export function getCategoryIconComponent(
  interestOrCategory?: string | null,
  customCategories?: any[]
): LucideIcon {
  if (interestOrCategory) {
    const directIcon = CATEGORY_ICON_MAP[interestOrCategory.trim().toLowerCase()];
    if (directIcon) return directIcon;
  }

  const matched = findMatchedCategoryObject(interestOrCategory, customCategories);
  if (matched?.icon) {
    const mappedIcon = CATEGORY_ICON_MAP[String(matched.icon).trim().toLowerCase()];
    if (mappedIcon) return mappedIcon;
  }

  const key = resolveWellnessCategoryKey(interestOrCategory, customCategories);
  return CATEGORY_ICON_BY_KEY[key] || Tag;
}

export function renderCategoryIcon(
  interestOrCategory?: string | null,
  className = "w-5 h-5 shrink-0",
  customCategories?: any[]
): React.ReactElement {
  const IconComponent = getCategoryIconComponent(interestOrCategory, customCategories);
  return React.createElement(IconComponent, { className, strokeWidth: 2 });
}

export function renderCategoryIconByKey(
  iconKey?: string | null,
  fallbackCategoryName?: string | null,
  className = "w-5 h-5 shrink-0"
): React.ReactElement {
  if (iconKey) {
    const cleanKey = iconKey.trim().toLowerCase();
    const DirectIcon = CATEGORY_ICON_MAP[cleanKey];
    if (DirectIcon) {
      return React.createElement(DirectIcon, { className, strokeWidth: 2 });
    }
  }
  return renderCategoryIcon(fallbackCategoryName, className);
}

export const InterestPill = ({ interest, className = "", size = "md" }: InterestPillProps) => {
  const dbCategories = useDynamicCategories();

  const pillTokenClass = getCategoryPillClass(interest, dbCategories);
  const customStyles = getCategoryCustomStyles(interest, dbCategories);
  const heightClass = size === 'sm' ? 'h-7 px-2.5' : 'h-8.5 px-3.5';
  const textClass = size === 'sm' ? 'text-meta' : 'text-xs';

  return (
    <div
      style={
        customStyles?.color && customStyles?.bgColor
          ? {
              backgroundColor: customStyles.bgColor,
              color: customStyles.color,
              borderColor: customStyles.borderColor,
            }
          : undefined
      }
      className={`${heightClass} ${pillTokenClass} rounded-full border flex justify-center items-center transition-all hover:brightness-95 shrink-0 ${className}`}
    >
      <span className={`${textClass} font-medium text-center line-clamp-1 truncate font-sans select-none text-current`}>
        {interest}
      </span>
    </div>
  );
};

export default InterestPill;
