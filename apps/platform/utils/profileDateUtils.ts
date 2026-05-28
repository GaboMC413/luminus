export const MONTHS = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

export const DAYS = Array.from({ length: 31 }, (_, i) => {
  const d = (i + 1).toString().padStart(2, '0');
  return { label: d, value: d };
});

const currentYearNum = new Date().getFullYear();
export const YEARS = Array.from({ length: currentYearNum - 1900 + 1 }, (_, i) => {
  const y = (currentYearNum - i).toString();
  return { label: y, value: y };
});

export const normalizeDate = (val: string): string => {
  let clean = val.replace(/\s+/g, '');
  if (!clean) return "";

  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 2)} / ${clean.slice(2, 4)} / ${clean.slice(4)}`;
  }

  if (/^\d{6}$/.test(clean)) {
    const year = parseInt(clean.slice(4));
    const fullYear = year > 26 ? '19' + year : '20' + year;
    return `${clean.slice(0, 2)} / ${clean.slice(2, 4)} / ${fullYear}`;
  }

  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 1) {
      if (parts[0].length === 1) parts[0] = '0' + parts[0];
      else if (parts[0].length > 2) parts[0] = parts[0].slice(0, 2);
    }
    if (parts.length >= 2) {
      if (parts[1].length === 1) parts[1] = '0' + parts[1];
      else if (parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    }
    if (parts.length >= 3) {
      if (parts[2].length === 2) {
        const yearNum = parseInt(parts[2]);
        parts[2] = (yearNum > 26 ? '19' : '20') + parts[2];
      } else if (parts[2].length > 4) {
        parts[2] = parts[2].slice(0, 4);
      }
    }

    let formatted = '';
    if (parts[0]) formatted += parts[0];
    if (parts[1]) formatted += ' / ' + parts[1];
    if (parts[2]) formatted += ' / ' + parts[2];
    return formatted;
  }

  const digits = clean.replace(/\D/g, '').slice(0, 8);
  if (digits.length >= 5) {
    return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
  } else if (digits.length >= 3) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return digits;
};

export const isValidBirthdate = (val: string): boolean => {
  const clean = val.replace(/\s+/g, '');
  const parts = clean.split('/').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
  if (parts.length !== 3) return false;

  const [day, month, year] = parts;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;

  return true;
};
