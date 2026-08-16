export interface Country {
  name: string;
  code: string;
  dial: string;
  priority?: boolean;
}

const PRIORITY_COUNTRIES: Country[] = [
  { name: "Argentina", code: "AR", dial: "+54", priority: true },
  { name: "Bolivia", code: "BO", dial: "+591", priority: true },
  { name: "Brasil", code: "BR", dial: "+55", priority: true },
  { name: "Chile", code: "CL", dial: "+56", priority: true },
  { name: "Colombia", code: "CO", dial: "+57", priority: true },
  { name: "Ecuador", code: "EC", dial: "+593", priority: true },
  { name: "España", code: "ES", dial: "+34", priority: true },
  { name: "Estados Unidos", code: "US", dial: "+1", priority: true },
  { name: "México", code: "MX", dial: "+52", priority: true },
  { name: "Paraguay", code: "PY", dial: "+595", priority: true },
  { name: "Perú", code: "PE", dial: "+51", priority: true },
  { name: "Uruguay", code: "UY", dial: "+598", priority: true },
  { name: "Venezuela", code: "VE", dial: "+58", priority: true },
];

const OTHER_COUNTRIES: Country[] = [
  { name: "Afganistán", code: "AF", dial: "+93" },
  { name: "Albania", code: "AL", dial: "+355" },
  { name: "Alemania", code: "DE", dial: "+49" },
  { name: "Andorra", code: "AD", dial: "+376" },
  { name: "Angola", code: "AO", dial: "+244" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Austria", code: "AT", dial: "+43" },
  { name: "Bélgica", code: "BE", dial: "+32" },
  { name: "Canadá", code: "CA", dial: "+1" },
  { name: "Costa Rica", code: "CR", dial: "+506" },
  { name: "Croacia", code: "HR", dial: "+385" },
  { name: "Cuba", code: "CU", dial: "+53" },
  { name: "Dinamarca", code: "DK", dial: "+45" },
  { name: "Egipto", code: "EG", dial: "+20" },
  { name: "El Salvador", code: "SV", dial: "+503" },
  { name: "Emiratos Árabes Unidos", code: "AE", dial: "+971" },
  { name: "Finlandia", code: "FI", dial: "+358" },
  { name: "Francia", code: "FR", dial: "+33" },
  { name: "Grecia", code: "GR", dial: "+30" },
  { name: "Guatemala", code: "GT", dial: "+502" },
  { name: "Honduras", code: "HN", dial: "+504" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "Irlanda", code: "IE", dial: "+353" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Italia", code: "IT", dial: "+39" },
  { name: "Japón", code: "JP", dial: "+81" },
  { name: "Nicaragua", code: "NI", dial: "+505" },
  { name: "Noruega", code: "NO", dial: "+47" },
  { name: "Países Bajos", code: "NL", dial: "+31" },
  { name: "Panamá", code: "PA", dial: "+507" },
  { name: "Polonia", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Puerto Rico", code: "PR", dial: "+1-787" },
  { name: "Reino Unido", code: "GB", dial: "+44" },
  { name: "República Checa", code: "CZ", dial: "+420" },
  { name: "República Dominicana", code: "DO", dial: "+1-809" },
  { name: "Suecia", code: "SE", dial: "+46" },
  { name: "Suiza", code: "CH", dial: "+41" },
];

export const COUNTRIES: Country[] = [
  ...PRIORITY_COUNTRIES,
  ...OTHER_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" })),
];
