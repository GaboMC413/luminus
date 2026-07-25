"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { COUNTRIES, Country } from "@/utils/countries";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface Course {
  name: string;
  description: string;
  url: string;
  coverUrl?: string;
}

const SPACE_TYPE_OPTIONS = [
  {
    label: "Consultorio",
    value: "Consultorio",
    description: "Atención individual, orientación profesional y sesiones personalizadas."
  },
  {
    label: "Clínica",
    value: "Clínica",
    description: "Consultas, evaluaciones y tratamientos con uno o varios profesionales."
  },
  {
    label: "Centro médico",
    value: "Centro médico",
    description: "Medicina, nutrición, salud preventiva y atención clínica."
  },
  {
    label: "Centro terapéutico",
    value: "Centro terapéutico",
    description: "Psicología, terapias corporales, prácticas complementarias y acompañamiento emocional."
  },
  {
    label: "Centro de rehabilitación",
    value: "Centro de rehabilitación",
    description: "Fisioterapia, recuperación física, movilidad y rehabilitación funcional."
  },
  {
    label: "Centro de actividad física",
    value: "Centro de actividad física",
    description: "Entrenamiento, yoga, pilates, movimiento y prácticas corporales."
  },
  {
    label: "Espacio multidisciplinario",
    value: "Espacio multidisciplinario",
    description: "Diferentes especialidades, enfoques y servicios reunidos en un mismo lugar."
  }
];

const TAG_GROUPS: Record<string, string[]> = {
  "Crecimiento personal": [
    "Coaching de vida",
    "Coaching ejecutivo",
    "Coaching ontológico",
    "Orientación vocacional",
    "Mentoría profesional",
    "Desarrollo de liderazgo",
    "Desarrollo organizacional",
    "Facilitación de procesos",
    "Formación en habilidades blandas",
    "Otro"
  ],
  "Bienestar emocional": [
    "Psicología",
    "Psicoterapia",
    "Terapia cognitivo-conductual",
    "Terapia sistémica",
    "Terapia gestáltica",
    "Terapia humanista",
    "Psicología positiva",
    "Acompañamiento en duelo",
    "Arteterapia",
    "Musicoterapia",
    "Otro"
  ],
  "Salud integral": [
    "Medicina general",
    "Medicina integrativa",
    "Medicina funcional",
    "Fisioterapia",
    "Terapia ocupacional",
    "Osteopatía",
    "Quiropraxia",
    "Medicina del dolor",
    "Medicina del sueño",
    "Ginecología",
    "Endocrinología",
    "Otro"
  ],
  "Movimiento físico": [
    "Entrenamiento personal",
    "Entrenamiento funcional",
    "Entrenamiento de fuerza",
    "Preparación física",
    "Yoga",
    "Pilates",
    "Movilidad",
    "Danza",
    "Calistenia",
    "Entrenamiento postural",
    "Acondicionamiento físico",
    "Otro"
  ],
  "Nutrición": [
    "Nutrición clínica",
    "Nutrición deportiva",
    "Nutrición funcional",
    "Nutrición vegetariana",
    "Nutrición vegana",
    "Nutrición materno-infantil",
    "Nutrición digestiva",
    "Nutrición hormonal",
    "Psiconutrición",
    "Educación alimentaria",
    "Otro"
  ],
  "Espiritualidad": [
    "Meditación",
    "Mindfulness",
    "Respiración consciente",
    "Acompañamiento espiritual",
    "Filosofía práctica",
    "Prácticas contemplativas",
    "Sonoterapia",
    "Facilitación de retiros",
    "Desarrollo espiritual",
    "Otro"
  ],
  "Vínculos": [
    "Terapia de pareja",
    "Terapia familiar",
    "Sexología",
    "Terapia sexual",
    "Mediación familiar",
    "Orientación parental",
    "Psicología perinatal",
    "Acompañamiento en crianza",
    "Comunicación interpersonal",
    "Otro"
  ],
  "Terapias complementarias": [
    "Acupuntura",
    "Medicina tradicional china",
    "Ayurveda",
    "Reiki",
    "Masoterapia",
    "Aromaterapia",
    "Reflexología",
    "Sonoterapia",
    "Terapia floral",
    "Terapias energéticas",
    "Biomagnetismo",
    "Otro"
  ]
};

const BENEFITS = [
  {
    icon: "business_center",
    title: "Presenta tu perfil profesional",
    description: "Haz visible tu experiencia, especialidad y enfoque de trabajo."
  },
  {
    icon: "calendar_check",
    title: "Agenda sesiones introductorias",
    description: "Coordina encuentros breves para un primer acercamiento."
  },
  {
    icon: "groups",
    title: "Crea grupos temáticos",
    description: "Abre espacios para compartir experiencias y recursos."
  },
  {
    icon: "chair",
    title: "Suma tu espacio a la red",
    description: "Publica tu consultorio, clínica o espacio de bienestar."
  },
  {
    icon: "books_movies_and_music",
    title: "Ofrece cursos y capacitaciones",
    description: "Acerca tus propuestas formativas a la comunidad."
  },
  {
    icon: "mic",
    title: "Participa en entrevistas",
    description: "Comparte tu mirada profesional y amplía tu visibilidad."
  }
];

export default function SpecialistOnboardingPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  // Step 1
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2
  const [specialty, setSpecialty] = useState("");
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Social links state
  interface SocialLink {
    platform: string;
    url: string;
  }
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Instagram", url: "" }
  ]);

  // Step 3
  const [sessionsChoice, setSessionsChoice] = useState<"yes" | "no" | null>(null);
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // Step 4: Consultorios
  const [clinicChoice, setClinicChoice] = useState<"yes" | "no" | null>(null);
  const [clinicEnabled, setClinicEnabled] = useState(false);
  const [spaceType, setSpaceType] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>({
    name: 'Uruguay',
    code: 'UY',
    dial: '+598',
    priority: true
  });
  const [clinicWebsite, setClinicWebsite] = useState("");
  const [suggestedPhotos, setSuggestedPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const [photoAttribution, setPhotoAttribution] = useState("");
  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Step 5
  const [coursesEnabled, setCoursesEnabled] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Error Field State for visual highlighting
  const [errorField, setErrorField] = useState<string | null>(null);

  // Focus & Auto-scroll Refs
  const termsCheckboxRef = useRef<HTMLInputElement>(null);
  const specialtySelectRef = useRef<HTMLDivElement>(null);
  const areasContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const institutionInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  const daysContainerRef = useRef<HTMLDivElement>(null);
  const clinicNameInputRef = useRef<HTMLInputElement>(null);
  const clinicAddressInputRef = useRef<HTMLInputElement>(null);

  const handleNextStep1 = () => {
    if (!termsAccepted) {
      setErrorField("terms");
      termsCheckboxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      termsCheckboxRef.current?.focus();
      return;
    }
    setErrorField(null);
    setStep(2);
  };

  const isValidUrl = (urlStr: string): boolean => {
    const trimmed = urlStr.trim();
    if (!trimmed) return true; // Empty is allowed as field is optional
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i;
    return urlPattern.test(trimmed);
  };

  const handleNextStep2 = () => {
    if (!specialty) {
      setErrorField("specialty");
      specialtySelectRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const selectBtn = specialtySelectRef.current?.querySelector("button");
      selectBtn?.focus();
      return;
    }
    if (selectedAreas.length === 0) {
      setErrorField("areas");
      areasContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!title.trim()) {
      setErrorField("title");
      titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus();
      return;
    }
    if (!institution.trim()) {
      setErrorField("institution");
      institutionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      institutionInputRef.current?.focus();
      return;
    }
    if (!bio.trim()) {
      setErrorField("bio");
      bioTextareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      bioTextareaRef.current?.focus();
      return;
    }

    // Validate optional social links format if entered
    const invalidSocialIndex = socialLinks.findIndex(l => l.url.trim() !== "" && !isValidUrl(l.url));
    if (invalidSocialIndex !== -1) {
      setErrorField(`socialLink_${invalidSocialIndex}`);
      const el = document.getElementById(`social-input-${invalidSocialIndex}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      return;
    }

    setErrorField(null);
    setStep(3);
  };

  const isStep3Valid = (() => {
    if (sessionsChoice === null) return false;
    if (sessionsChoice === "no") return true;
    if (sessionsChoice === "yes") {
      return selectedDays.length > 0 && Boolean(startTime) && Boolean(endTime);
    }
    return false;
  })();

  const handleNextStep3 = () => {
    if (sessionsChoice === null) {
      setErrorField("sessionsChoice");
      return;
    }
    if (sessionsChoice === "yes" && selectedDays.length === 0) {
      setErrorField("days");
      daysContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (sessionsChoice === "no") {
      setSelectedDays([]);
      setSessionsEnabled(false);
    } else {
      setSessionsEnabled(true);
    }
    setErrorField(null);
    setStep(4);
  };

  const handleSelectPlace = async (
    placeId: string,
    description: string,
    mainText: string,
    isAddressOnly = false
  ) => {
    try {
      const results = await getGeocode({ placeId });
      if (results && results[0]) {
        const first = results[0];
        const addressComponents = first.address_components;

        let foundCity = "";
        let foundCountry = "";
        let foundIsoCode = "";

        for (const comp of addressComponents) {
          if (comp.types.includes("locality") || comp.types.includes("administrative_area_level_1")) {
            if (!foundCity) foundCity = comp.long_name;
          }
          if (comp.types.includes("country")) {
            foundCountry = comp.long_name;
            foundIsoCode = comp.short_name.toUpperCase();
          }
        }

        const { lat: getLat, lng: getLng } = await getLatLng(first);

        setClinicAddress(first.formatted_address || description);
        setCity(foundCity);
        setCountry(foundCountry);
        setCountryIsoCode(foundIsoCode);
        setLat(getLat);
        setLng(getLng);
        setGooglePlaceId(placeId);

        // ONLY update clinicName if this is NOT address-only change, or if clinicName is empty
        if (!isAddressOnly) {
          if (!clinicName.trim()) {
            setClinicName(mainText || description.split(",")[0].trim());
          }
        }

        if (errorField === "clinicName" || errorField === "clinicAddress" || errorField === "clinicChoice") {
          setErrorField(null);
        }

        // Determine country object from COUNTRIES utility and update PhoneInput country
        const matchedCountry = COUNTRIES.find((c) => c.code.toUpperCase() === foundIsoCode);
        if (matchedCountry) {
          setPhoneCountry(matchedCountry);
        }

        if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
          const dummy = document.createElement("div");
          const service = new (window as any).google.maps.places.PlacesService(dummy);
          service.getDetails(
            {
              placeId,
              fields: [
                "name",
                "formatted_address",
                "formatted_phone_number",
                "international_phone_number",
                "website",
                "photos",
                "url"
              ]
            },
            (placeDetail: any, detailStatus: any) => {
              if (detailStatus === (window as any).google.maps.places.PlacesServiceStatus.OK && placeDetail) {
                if (!isAddressOnly && placeDetail.name && !clinicName.trim()) {
                  setClinicName(placeDetail.name);
                }
                if (placeDetail.website) setClinicWebsite(placeDetail.website);
                if (placeDetail.url) setGoogleMapsUrl(placeDetail.url);

                const rawPhone = placeDetail.international_phone_number || placeDetail.formatted_phone_number;
                if (rawPhone) {
                  // Strip dial code if prefix matches matchedCountry dial code
                  const dialPrefix = matchedCountry?.dial || "";
                  let nationalDigits = rawPhone;
                  if (dialPrefix && nationalDigits.startsWith(dialPrefix)) {
                    nationalDigits = nationalDigits.slice(dialPrefix.length).trim();
                  } else if (nationalDigits.startsWith("+")) {
                    nationalDigits = nationalDigits.replace(/^\+\d+\s*/, "");
                  }
                  setClinicPhone(nationalDigits);
                }

                if (placeDetail.photos && placeDetail.photos.length > 0) {
                  const photoUrls = placeDetail.photos.map((p: any) => p.getUrl({ maxWidth: 800, maxHeight: 600 }));
                  setSuggestedPhotos(photoUrls);
                  setActivePhotoIndex(0);
                  setSelectedPhotoUrl("");
                  const attrStr = placeDetail.photos[0].html_attributions?.[0] || "Foto de Google Maps";
                  setPhotoAttribution(attrStr);
                } else {
                  setSuggestedPhotos([]);
                  setSelectedPhotoUrl("");
                  setPhotoAttribution("");
                }
              }
            }
          );
        }
      }
    } catch (err) {
      console.error("Error geocoding selected place:", err);
    }
  };

  const isStep4Valid = (() => {
    if (clinicChoice === null) return false;
    if (clinicChoice === "no") return true;
    if (clinicChoice === "yes") {
      return (
        Boolean(clinicName.trim()) &&
        Boolean(clinicAddress.trim()) &&
        Boolean(city.trim()) &&
        Boolean(country.trim())
      );
    }
    return false;
  })();

  const handleNextStep4 = () => {
    if (clinicChoice === null) {
      setErrorField("clinicChoice");
      return;
    }
    if (clinicChoice === "yes") {
      if (!clinicName.trim()) {
        setErrorField("clinicName");
        clinicNameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        clinicNameInputRef.current?.focus();
        return;
      }
      if (!clinicAddress.trim()) {
        setErrorField("clinicAddress");
        clinicAddressInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        clinicAddressInputRef.current?.focus();
        return;
      }
      if (!city.trim()) {
        setErrorField("city");
        return;
      }
      if (!country.trim()) {
        setErrorField("country");
        return;
      }
      // Auto-select first suggested photo if user hasn't chosen one yet
      if (!selectedPhotoUrl && suggestedPhotos.length > 0) {
        setSelectedPhotoUrl(suggestedPhotos[activePhotoIndex]);
      }
      setClinicEnabled(true);
    } else {
      setClinicEnabled(false);
    }
    setErrorField(null);
    setStep(5);
  };

  // Reset scroll on step change
  useEffect(() => {
    window.scrollTo(0, 0);
    setErrorField(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [step]);

  const specialtyOptions = [
    "Crecimiento personal",
    "Bienestar emocional",
    "Salud integral",
    "Movimiento físico",
    "Nutrición",
    "Espiritualidad",
    "Vínculos",
    "Terapias complementarias"
  ];

  const hoursOptions = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00"
  ];

  const daysOfWeek = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  // Course Helpers
  const handleAddCourse = () => {
    setCourses([...courses, { name: "", description: "", url: "", coverUrl: "" }]);
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  const toggleDay = (day: string) => {
    if (errorField === "days") setErrorField(null);
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const [customAreaInput, setCustomAreaInput] = useState("");
  const [customAreas, setCustomAreas] = useState<string[]>([]);

  const toggleArea = (area: string) => {
    if (errorField === "areas") setErrorField(null);
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleAddCustomArea = () => {
    const trimmed = customAreaInput.trim();
    if (trimmed && !selectedAreas.includes(trimmed)) {
      setSelectedAreas([...selectedAreas, trimmed]);
      setCustomAreas([...customAreas, trimmed]);
      setCustomAreaInput("");
    }
  };

  const handleRemoveCustomArea = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter(a => a !== areaToRemove));
    setCustomAreas(customAreas.filter(a => a !== areaToRemove));
  };

  const ALL_PLATFORMS = ["Instagram", "Facebook", "YouTube", "LinkedIn", "X", "Website"];

  const getSocialPlaceholder = (platform: string): string => {
    if (!platform) return "";
    switch (platform.toLowerCase()) {
      case "youtube":
        return "https://www.youtube.com/...";
      case "instagram":
        return "https://www.instagram.com/...";
      case "facebook":
        return "https://www.facebook.com/...";
      case "linkedin":
        return "https://www.linkedin.com/in/...";
      case "x":
      case "twitter":
        return "https://x.com/...";
      case "website":
        return "https://...";
      default:
        return "";
    }
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleAddSocialLinkRow = () => {
    const used = socialLinks.map(l => l.platform);
    const unused = ALL_PLATFORMS.find(p => !used.includes(p)) || "";
    setSocialLinks([...socialLinks, { platform: unused, url: "" }]);
  };

  const handleRemoveSocialLinkRow = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const linkedinObj = socialLinks.find((l) => l.platform.toLowerCase() === "linkedin");
      const instagramObj = socialLinks.find((l) => l.platform.toLowerCase() === "instagram");
      const websiteObj = socialLinks.find((l) => l.platform.toLowerCase() === "website" || l.platform.toLowerCase() === "web");

      const payload = {
        specialty,
        title,
        bio,
        clinicType: clinicChoice === "yes" ? spaceType : null,
        clinicName: clinicChoice === "yes" ? clinicName : null,
        clinicAddress: clinicChoice === "yes" ? clinicAddress : null,
        clinicCity: clinicChoice === "yes" ? city : null,
        clinicCountry: clinicChoice === "yes" ? country : null,
        clinicLat: clinicChoice === "yes" ? lat : null,
        clinicLng: clinicChoice === "yes" ? lng : null,
        googlePlaceId: clinicChoice === "yes" ? googlePlaceId : null,
        googleMapsUrl: clinicChoice === "yes" ? googleMapsUrl : null,
        clinicPhone: clinicChoice === "yes" ? (clinicPhone.trim() ? `${phoneCountry.dial} ${clinicPhone.trim()}` : null) : null,
        clinicWebsite: clinicChoice === "yes" ? clinicWebsite : null,
        clinicCoverUrl: clinicChoice === "yes" ? selectedPhotoUrl : null,
        linkedinUrl: linkedinObj?.url || null,
        instagramUrl: instagramObj?.url || null,
        websiteUrl: websiteObj?.url || null,
        courses: coursesEnabled ? courses.map(c => ({ name: c.name, description: c.description, url: c.url })) : [],
      };

      const response = await fetch("/api/especialistas/postulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Error al enviar la postulación.");
        return;
      }

      setStep(6); // Go to thank you screen
    } catch (err) {
      console.error("Failed to submit postulation:", err);
      alert("Error de conexión al enviar la postulación.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min(((step - 1) / 5) * 100, 100);

  // Render Left Branding Panel
  const renderSidebar = () => {
    return (
      <div className="fixed top-0 left-0 right-0 lg:relative w-full h-14 lg:h-full lg:w-80 xl:w-96 luminus-gradient shrink-0 flex lg:flex-col items-center justify-between lg:py-12 px-6 lg:px-8 z-50 transition-all duration-500">
        <div className="flex flex-col items-center w-full">
          <Link href="/especialistas" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px] lg:h-[24px]" />
          </Link>

          {/* Stepper progress (Desktop only) */}
          {step <= 5 && (
            <div className="hidden lg:flex flex-col gap-6 w-full mt-16 text-white/90">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Progreso</span>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2 font-jakarta">
                {[
                  { num: 1, label: "Introducción" },
                  { num: 2, label: "Perfil Profesional" },
                  { num: 3, label: "Disponibilidad" },
                  { num: 4, label: "Consultorios" },
                  { num: 5, label: "Cursos y Talleres" }
                ].map(s => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  return (
                    <div key={s.num} className="flex gap-3 items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all border ${isActive
                        ? "bg-white text-black border-white"
                        : isCompleted
                          ? "bg-white/20 text-white border-transparent"
                          : "bg-transparent text-white/40 border-white/20"
                        }`}>
                        {isCompleted ? "✓" : s.num}
                      </div>
                      <span className={`text-[13px] font-medium tracking-wide transition-all ${isActive ? "text-white font-bold" : isCompleted ? "text-white/70" : "text-white/40"
                        }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="hidden lg:flex flex-col w-full pt-6 border-t border-white/10 mt-12">
          <p className="text-[9px] text-white/60 text-center uppercase tracking-widest font-sans">
            Luminus Latam © 2026
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="auth-fixed-page bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">

      {/* 1. Left Sidebar */}
      {renderSidebar()}

      {/* 2. Main Onboarding wizard pane */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto pt-14 lg:pt-0"
      >
        <div className="flex-1 flex flex-col items-center pt-8 md:pt-16 pb-12 md:pb-24 px-6 md:px-12">
          <div className="w-full max-w-[344px] md:max-w-[580px] flex flex-col">

            {/* Step 1: Welcome & Terms */}
            {step === 1 && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <div className="flex flex-col gap-3 md:gap-3.5">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Forma parte de nuestra red de especialistas
                  </h1>
                  <p className="text-body-secondary leading-relaxed">
                    Una plataforma para conectar, compartir y hacer crecer tu propuesta profesional.
                  </p>
                </div>

                {/* Benefit Cards (2x3 Grid Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  {BENEFITS.map((benefit, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200/60 flex flex-col gap-2 transition-all hover:border-zinc-300">
                      <span className="material-symbols-rounded text-slate-700 text-[24px] shrink-0">
                        {benefit.icon}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[14px] md:text-[15px] font-bold text-slate-900 font-jakarta leading-snug">
                          {benefit.title}
                        </h3>
                        <p className="text-[13px] text-slate-500 font-sans leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consejo de Expertos Disclaimer (Plain text, no box, no icon) */}
                <p className="text-[13px] md:text-[14px] text-slate-500 font-sans leading-relaxed mt-1">
                  LUMINUS reúne a especialistas con formación, experiencia y una práctica profesional responsable. Cada postulación es evaluada por nuestro Consejo de Expertos, que revisa las credenciales, la trayectoria y la coherencia del perfil antes de aprobar su incorporación.
                </p>

                {/* Terms and conditions checkbox */}
                <div className="flex flex-col gap-1 mt-2 px-1">
                  <div className="flex items-center gap-3">
                    <input
                      ref={termsCheckboxRef}
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (errorField === "terms") setErrorField(null);
                      }}
                      className="w-5 h-5 rounded border-zinc-300 accent-emerald-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                    />
                    <label htmlFor="terms" className="text-[13px] text-slate-600 font-normal leading-normal cursor-pointer select-none">
                      Acepto las{" "}
                      <Link
                        href="https://dev.luminuslatam.com/legal/condiciones-especialistas"
                        target="_blank"
                        className="font-semibold text-black underline hover:text-zinc-800"
                      >
                        Condiciones de Uso y Políticas para Especialistas
                      </Link>{" "}
                      de la plataforma.
                    </label>
                  </div>
                  {errorField === "terms" && (
                    <p className="text-[#FF3D3D] text-[12px] font-bold ml-8">Debes aceptar las condiciones para continuar</p>
                  )}
                </div>

                <div className="flex justify-between items-center gap-3 mt-6 pt-2">
                  <Button
                    onClick={() => router.push("/especialistas")}
                    variant="back"
                  >
                    Volver a Especialistas
                  </Button>
                  <Button
                    onClick={handleNextStep1}
                    variant="primary"
                    className="!w-auto px-6 gap-2"
                  >
                    Continuar
                    <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Professional Data */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-title-display font-jakarta">
                    Perfil profesional
                  </h1>
                  <p className="text-body-secondary">
                    Comparte información sobre tu especialidad, experiencia y forma de trabajo.
                  </p>
                </div>

                <div className="flex flex-col gap-5 mt-2">
                  {/* 1. Primary Specialty */}
                  <div className="flex flex-col gap-1">
                    <SelectInput
                      ref={specialtySelectRef}
                      label="Especialidad principal *"
                      value={specialty}
                      options={specialtyOptions}
                      error={errorField === "specialty"}
                      onSelect={(val) => {
                        setSpecialty(val);
                        setSelectedAreas([]);
                        if (errorField === "specialty") setErrorField(null);
                      }}
                      placeholder="Seleccioná tu especialidad principal"
                    />
                    {errorField === "specialty" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Selecciona tu especialidad principal</p>
                    )}
                  </div>

                  {/* 2. Accompaniment Areas (Appears only when Specialty is selected) */}
                  {specialty && (
                    <div ref={areasContainerRef} className="flex flex-col gap-3 mt-2 animate-in fade-in duration-200">
                      <label className="text-label ml-1">Áreas de acompañamiento *</label>
                      <p className="text-body-secondary text-[13px] ml-1 -mt-1">
                        Selecciona las áreas en las que brindas acompañamiento. Puedes elegir varias opciones o agregar una nueva.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {(TAG_GROUPS[specialty] || []).map(tag => {
                          const isSelected = selectedAreas.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleArea(tag)}
                              className={`h-8 md:h-9 px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-200 border cursor-pointer flex items-center gap-1.5 ${isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                                }`}
                            >
                              {tag}
                              {isSelected && (
                                <span className="material-symbols-rounded text-[14px] shrink-0">check</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {errorField === "areas" && (
                        <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Selecciona al menos un área de acompañamiento</p>
                      )}

                      {selectedAreas.includes("Otro") && (
                        <div className="flex flex-col gap-2.5 mt-2 animate-in fade-in duration-200">
                          <div className="flex gap-2 items-center">
                            <InputField
                              type="text"
                              value={customAreaInput}
                              onChange={(e) => setCustomAreaInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomArea();
                                }
                              }}
                              placeholder="Agregar otra área de acompañamiento"
                            />
                            <Button
                              type="button"
                              onClick={handleAddCustomArea}
                              variant="secondary"
                              className="!w-auto px-5 shrink-0"
                            >
                              Agregar
                            </Button>
                          </div>

                          {customAreas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {customAreas.map((cArea) => (
                                <span key={cArea} className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-medium bg-emerald-600 text-white">
                                  {cArea}
                                  <span className="material-symbols-rounded text-[14px] shrink-0">check</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomArea(cArea)}
                                    className="hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-none text-white text-xs font-bold ml-0.5"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Professional Title */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-label ml-1">Título profesional *</label>
                    <InputField
                      ref={titleInputRef}
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errorField === "title") setErrorField(null);
                      }}
                      placeholder="Ingresa tu título profesional"
                      className={errorField === "title" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                    />
                    {errorField === "title" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa tu título profesional</p>
                    )}
                  </div>

                  {/* 4. Educational Institution */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-label ml-1">Institución de formación *</label>
                    <InputField
                      ref={institutionInputRef}
                      type="text"
                      value={institution}
                      onChange={(e) => {
                        setInstitution(e.target.value);
                        if (errorField === "institution") setErrorField(null);
                      }}
                      placeholder="Indica la institución donde te formaste"
                      className={errorField === "institution" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                    />
                    {errorField === "institution" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Indica la institución donde te formaste</p>
                    )}
                  </div>

                  {/* 5. Bio */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-label ml-1">Biografía y enfoque *</label>
                    <textarea
                      ref={bioTextareaRef}
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value);
                        if (errorField === "bio") setErrorField(null);
                      }}
                      placeholder="Resume tu trayectoria, tu enfoque profesional y la forma en que desarrollas tu práctica."
                      rows={5}
                      className={`reg-input-bordered !h-auto p-4 resize-none ${errorField === "bio" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}`}
                    />
                    {errorField === "bio" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Completa tu biografía profesional</p>
                    )}
                  </div>

                  {/* 6. Dynamic Social Links List */}
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-label ml-1">Redes profesionales</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                        Opcional
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {socialLinks.map((link, idx) => {
                        const availablePlatforms = ALL_PLATFORMS.filter(
                          (p) => p === link.platform || !socialLinks.some((other, otherIdx) => otherIdx !== idx && other.platform === p)
                        );
                        const hasLinkError = errorField === `socialLink_${idx}`;
                        return (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex gap-2 items-center">
                              <div className="w-36 shrink-0">
                                <SelectInput
                                  value={link.platform}
                                  options={availablePlatforms}
                                  placeholder="Seleccionar"
                                  onSelect={(val) => handleSocialLinkChange(idx, "platform", val)}
                                />
                              </div>
                              <InputField
                                id={`social-input-${idx}`}
                                type="text"
                                value={link.url}
                                onChange={(e) => {
                                  handleSocialLinkChange(idx, "url", e.target.value);
                                  if (errorField === `socialLink_${idx}`) setErrorField(null);
                                }}
                                placeholder={getSocialPlaceholder(link.platform)}
                                className={hasLinkError ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                              />
                              {socialLinks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSocialLinkRow(idx)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-transparent border-none cursor-pointer shrink-0"
                                  title="Eliminar enlace"
                                >
                                  <span className="material-symbols-rounded text-[20px] block">delete</span>
                                </button>
                              )}
                            </div>
                            {hasLinkError && (
                              <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa una URL o enlace válido</p>
                            )}
                          </div>
                        );
                      })}

                      {socialLinks.length < ALL_PLATFORMS.length && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddSocialLinkRow}
                          className="!w-auto self-start mt-1"
                        >
                          Agregar otro enlace
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 7. Professional Resume (Optional - Positioned after social media) */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-label ml-1">Currículum profesional</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                        Opcional
                      </span>
                    </div>
                    <p className="text-body-secondary text-[13px] ml-1 -mt-1">
                      Puedes adjuntar tu currículum para ampliar la información de tu perfil.
                    </p>
                    <div className="flex flex-col gap-2.5 mt-1 w-full">
                      <input
                        type="file"
                        ref={resumeInputRef}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setResumeFile(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => resumeInputRef.current?.click()}
                        className="w-full gap-2"
                      >
                        <span className="material-symbols-rounded text-[18px]">upload_file</span>
                        {resumeFile ? "Cambiar currículum" : "Subir currículum"}
                      </Button>
                      {resumeFile && (
                        <div className="flex items-center justify-between w-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl text-[13px] font-medium animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 truncate">
                            <span className="material-symbols-rounded text-[18px] text-emerald-600 shrink-0">attach_file</span>
                            <span className="truncate">{resumeFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setResumeFile(null);
                              if (resumeInputRef.current) resumeInputRef.current.value = "";
                            }}
                            className="text-emerald-700 hover:text-red-500 transition-colors ml-2 bg-transparent border-none cursor-pointer shrink-0 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-3 mt-8 pt-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="back"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={handleNextStep2}
                    variant="primary"
                    className="!w-auto px-6 gap-2"
                  >
                    Siguiente
                    <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Sessions */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Sesiones de primer contacto
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Ofrece encuentros breves para que nuevos usuarios conozcan tu enfoque profesional.
                  </p>
                </div>

                <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed font-sans mt-1">
                  <p>
                    Las sesiones tienen una duración de 15 minutos. Podrás revisar cada solicitud y decidir si deseas aceptarla antes de incorporarla a tu agenda.
                  </p>
                </div>

                {/* Question & 2 Options */}
                <div className="flex flex-col gap-3 mt-1">
                  <label className="text-label ml-1 font-jakarta font-bold text-slate-900">
                    ¿Deseas ofrecer sesiones de primer contacto?
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Option 1 */}
                    <div
                      onClick={() => {
                        setSessionsChoice("yes");
                        setSessionsEnabled(true);
                        if (errorField === "sessionsChoice") setErrorField(null);
                      }}
                      className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                        sessionsChoice === "yes"
                          ? "border-emerald-600 bg-emerald-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                          Sí, quiero ofrecer sesiones
                        </span>
                        <span className="text-[13px] text-slate-500 font-sans leading-normal">
                          Los usuarios podrán solicitarte encuentros introductorios de 15 minutos.
                        </span>
                      </div>

                      {/* Expanded Availability inside Option 1 */}
                      {sessionsChoice === "yes" && (
                        <div
                          className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200/80 animate-in fade-in duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col gap-0.5">
                            <h3 className="text-[14px] font-bold text-slate-900 font-jakarta">
                              Disponibilidad para sesiones
                            </h3>
                            <p className="text-slate-500 text-[13px]">
                              Selecciona los días y horarios en los que puedes recibir solicitudes.
                            </p>
                          </div>

                          {/* Days availability */}
                          <div ref={daysContainerRef} className="flex flex-col gap-2 mt-1">
                            <label className="text-label ml-1 font-jakarta font-bold text-slate-800">
                              Días disponibles
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {daysOfWeek.map((day) => {
                                const isChecked = selectedDays.includes(day);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`h-8 md:h-9 px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-200 border cursor-pointer select-none flex items-center gap-1.5 ${
                                      isChecked
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                                    }`}
                                  >
                                    {day}
                                    {isChecked && (
                                      <span className="material-symbols-rounded text-[14px] shrink-0">check</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {errorField === "days" && (
                              <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
                                Selecciona al menos un día de disponibilidad
                              </p>
                            )}
                          </div>

                          {/* Time dropdowns */}
                          <div className="grid grid-cols-2 gap-4 mt-1">
                            <SelectInput
                              label="Desde"
                              value={startTime}
                              options={hoursOptions.slice(0, -1)}
                              onSelect={(val) => {
                                setStartTime(val);
                                if (endTime <= val) {
                                  const validEnds = hoursOptions.filter((h) => h > val);
                                  if (validEnds.length > 0) setEndTime(validEnds[0]);
                                }
                              }}
                            />
                            <SelectInput
                              label="Hasta"
                              value={endTime}
                              options={hoursOptions.filter((h) => h > startTime)}
                              onSelect={(val) => setEndTime(val)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 2 */}
                    <div
                      onClick={() => {
                        setSessionsChoice("no");
                        setSessionsEnabled(false);
                        if (errorField === "days") setErrorField(null);
                        if (errorField === "sessionsChoice") setErrorField(null);
                      }}
                      className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                        sessionsChoice === "no"
                          ? "border-emerald-600 bg-emerald-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                          No por el momento
                        </span>
                        <span className="text-[13px] text-slate-500 font-sans leading-normal">
                          Podrás activar esta opción más adelante desde tu perfil.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center gap-3 mt-8 pt-2">
                  <Button
                    onClick={() => setStep(2)}
                    variant="back"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={handleNextStep3}
                    disabled={!isStep3Valid}
                    variant="primary"
                    className="!w-auto px-6 gap-2"
                  >
                    Continuar
                    <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Clinics */}
            {step === 4 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Consultorios y espacios de atención
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Agrega los espacios donde brindas atención presencial y hazlos visibles dentro de la red.
                  </p>
                </div>

                {/* Question & 2 Selectable Option Cards */}
                <div className="flex flex-col gap-3 mt-1">
                  <label className="text-label ml-1 font-jakarta font-bold text-slate-900">
                    ¿Deseas agregar un espacio de atención presencial?
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Option 1: Yes */}
                    <div
                      onClick={() => {
                        setClinicChoice("yes");
                        setClinicEnabled(true);
                        if (errorField === "clinicChoice") setErrorField(null);
                      }}
                      className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                        clinicChoice === "yes"
                          ? "border-emerald-600 bg-emerald-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                          Sí, quiero agregar un espacio
                        </span>
                        <span className="text-[13px] text-slate-500 font-sans leading-normal">
                          Publica el consultorio, clínica o espacio donde atiendes presencialmente.
                        </span>
                      </div>

                      {/* Expanded Unified Editable Form inside Option 1 Card */}
                      {clinicChoice === "yes" && (
                        <div
                          className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200/80 animate-in fade-in duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Search Input & Helper Text */}
                          <div className="flex flex-col gap-1.5">
                            <h3 className="text-[14px] font-bold text-slate-900 font-jakarta">
                              Busca tu espacio
                            </h3>
                            <PlacesSearchAutocomplete
                              onPlaceSelect={handleSelectPlace}
                              placeholder="Nombre del espacio o dirección"
                              clearOnSelect={true}
                            />
                            <p className="text-slate-500 text-[13px] ml-1">
                              Selecciona un resultado para completar los datos automáticamente. Luego podrás revisarlos y editarlos.
                            </p>
                          </div>

                          {/* Editable Form Fields */}
                          <div className="flex flex-col gap-4">
                            {/* Tipo de espacio */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex flex-col gap-0.5">
                                <label className="text-label ml-1">Tipo de espacio *</label>
                                <p className="text-slate-500 text-[13px] ml-1">
                                  Selecciona el tipo de espacio según las principales actividades o servicios que ofrece.
                                </p>
                              </div>
                              <SelectInput
                                value={spaceType}
                                options={SPACE_TYPE_OPTIONS}
                                onSelect={(val) => setSpaceType(val)}
                                placeholder="Selecciona"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-label ml-1">Nombre del espacio *</label>
                              <InputField
                                type="text"
                                value={clinicName}
                                onChange={(e) => {
                                  setClinicName(e.target.value);
                                  if (errorField === "clinicName") setErrorField(null);
                                }}
                                placeholder="Ej. Consultorio Palermo / Centro Vital"
                                className={errorField === "clinicName" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                              />
                              {errorField === "clinicName" && (
                                <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa el nombre del espacio</p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-label ml-1">Dirección completa *</label>
                              <PlacesSearchAutocomplete
                                value={clinicAddress}
                                onChange={(val) => {
                                  setClinicAddress(val);
                                  if (errorField === "clinicAddress") setErrorField(null);
                                }}
                                onPlaceSelect={(placeId, description, mainText) =>
                                  handleSelectPlace(placeId, description, mainText, true)
                                }
                                placeholder="Calle, Altura, Ciudad, País"
                                error={errorField === "clinicAddress"}
                              />
                              {errorField === "clinicAddress" && (
                                <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa la dirección completa</p>
                              )}

                              {/* Map Pin Preview (Directly Below Direction Field) */}
                              {lat !== null && lng !== null && (
                                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center mt-1">
                                  <iframe
                                    title="Mapa de ubicación"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${lat},${lng}&zoom=15`}
                                  />
                                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-lg text-[12px] font-medium text-slate-800 border border-slate-200 flex items-center gap-1.5">
                                    <span className="material-symbols-rounded text-slate-900 text-[16px]">location_on</span>
                                    <span className="truncate max-w-[240px]">{clinicName || clinicAddress}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-label ml-1">Ciudad *</label>
                                <InputField
                                  type="text"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  placeholder="Ej. Buenos Aires"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-label ml-1">País *</label>
                                <InputField
                                  type="text"
                                  value={country}
                                  onChange={(e) => {
                                    const newCountry = e.target.value;
                                    setCountry(newCountry);
                                    const matched = COUNTRIES.find((c) => c.name.toLowerCase() === newCountry.toLowerCase());
                                    if (matched) {
                                      setPhoneCountry(matched);
                                    }
                                  }}
                                  placeholder="Ej. Argentina"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-label ml-1">Sitio web</label>
                              <InputField
                                type="url"
                                value={clinicWebsite}
                                onChange={(e) => setClinicWebsite(e.target.value)}
                                placeholder="https://..."
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-label ml-1">Teléfono</label>
                              <PhoneInput
                                value={clinicPhone}
                                phoneCountry={phoneCountry}
                                onCountryChange={(matched) => setPhoneCountry(matched)}
                                onChange={(newNumber) => setClinicPhone(newNumber)}
                              />
                            </div>
                          </div>

                          {/* Image Upload Section */}
                          <div className="flex flex-col gap-2">
                            <label className="text-label ml-1">Imagen del espacio</label>

                            {isOptimizingImage ? (
                              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-lg gap-2 text-center animate-in fade-in duration-200">
                                <span className="animate-spin material-symbols-rounded text-emerald-600 text-[24px]">progress_activity</span>
                                <span className="text-[13px] font-semibold text-slate-800">Optimizando imagen automáticamente...</span>
                                <span className="text-[11px] text-slate-400">Reduciendo tamaño y convirtiendo a formato WebP ligero</span>
                              </div>
                            ) : selectedPhotoUrl ? (
                              <div className="flex flex-col gap-2.5">
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                  <img
                                    src={selectedPhotoUrl}
                                    alt="Imagen del espacio"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold w-7 h-7 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-rounded text-[16px]">check</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => photoFileInputRef.current?.click()}
                                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span className="material-symbols-rounded text-[16px]">upload_file</span>
                                    Cambiar imagen
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPhotoUrl("")}
                                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-red-600 border border-slate-200 hover:bg-red-50 transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span className="material-symbols-rounded text-[16px]">delete</span>
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            ) : suggestedPhotos.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                <span className="text-slate-500 text-[13px] ml-1">Sugerencia de Google Places</span>
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                  <img
                                    src={suggestedPhotos[activePhotoIndex]}
                                    alt="Foto del espacio"
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex flex-wrap gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPhotoUrl(suggestedPhotos[activePhotoIndex])}
                                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-black text-white hover:bg-zinc-800 transition cursor-pointer"
                                  >
                                    Usar esta imagen
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => photoFileInputRef.current?.click()}
                                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                                  >
                                    Subir otra
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => photoFileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition cursor-pointer bg-slate-50/50 hover:bg-slate-50 gap-1.5 text-center"
                              >
                                <span className="material-symbols-rounded text-[26px] text-slate-400">upload_file</span>
                                <span className="text-[13px] font-semibold text-slate-700">Subir una imagen propia</span>
                                <span className="text-[11px] text-slate-400">Archivos JPG, PNG o WEBP</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 2: No */}
                    <div
                      onClick={() => {
                        setClinicChoice("no");
                        setClinicEnabled(false);
                        if (errorField === "clinicName" || errorField === "clinicAddress" || errorField === "clinicChoice") {
                          setErrorField(null);
                        }
                      }}
                      className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                        clinicChoice === "no"
                          ? "border-emerald-600 bg-emerald-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                          No por el momento
                        </span>
                        <span className="text-[13px] text-slate-500 font-sans leading-normal">
                          Podrás agregarlo más adelante desde tu perfil.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input for Custom Photo Upload */}
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsOptimizingImage(true);
                      try {
                        const optimizedDataUrl = await optimizeImageFile(file, 1200, 1200, 0.82);
                        setSelectedPhotoUrl(optimizedDataUrl);
                      } catch (err) {
                        console.error("Error optimizing image file:", err);
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setSelectedPhotoUrl(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      } finally {
                        setIsOptimizingImage(false);
                      }
                    }
                    e.target.value = "";
                  }}
                />

                {/* Footer Actions */}
                <div className="flex justify-between items-center gap-3 mt-8 pt-2">
                  <Button onClick={() => setStep(3)} variant="back">
                    Atrás
                  </Button>
                  <Button
                    onClick={handleNextStep4}
                    disabled={!isStep4Valid}
                    variant="primary"
                    className="!w-auto px-6 gap-2"
                  >
                    Continuar
                    <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Courses */}
            {step === 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Cursos y Talleres Externos
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Comparte tus formaciones, cursos o talleres actuales.
                  </p>
                </div>

                <div className="flex flex-col gap-5 text-[14px] text-slate-600 leading-relaxed font-sans mt-2">
                  <p>
                    Si tienes cursos grabados, talleres presenciales o programas en plataformas externas, puedes listarlos aquí para darles visibilidad en tu perfil. Luminus no gestionará las inscripciones ni cobros de estos cursos.
                  </p>
                </div>

                {/* Courses Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 mt-2 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-slate-900 font-jakarta">Agregar cursos o talleres</span>
                    <span className="text-[11px] text-slate-400">Habilita esta opción para listar tus programas</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoursesEnabled(!coursesEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out cursor-pointer ${coursesEnabled ? "bg-black" : "bg-zinc-200"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${coursesEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {/* Courses Dynamic Form */}
                {coursesEnabled && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Mis Cursos</span>
                      <button
                        type="button"
                        onClick={handleAddCourse}
                        className="text-[12px] font-bold text-slate-900 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Agregar Curso
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {courses.map((course, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                          <div className="flex-1 flex flex-col gap-3">
                            <InputField
                              type="text"
                              value={course.name}
                              onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                              placeholder="Nombre del Curso / Taller *"
                              className="!h-10 !text-[13px] !bg-white"
                            />
                            <textarea
                              value={course.description}
                              onChange={(e) => handleCourseChange(idx, 'description', e.target.value)}
                              placeholder="Descripción breve *"
                              rows={2}
                              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-[13px] text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none placeholder:text-slate-400 font-sans"
                            />
                            <InputField
                              type="url"
                              value={course.url}
                              onChange={(e) => handleCourseChange(idx, 'url', e.target.value)}
                              placeholder="Enlace URL al Curso (ej. https://...) *"
                              className="!h-10 !text-[13px] !bg-white"
                            />
                            <InputField
                              type="url"
                              value={course.coverUrl || ""}
                              onChange={(e) => handleCourseChange(idx, 'coverUrl', e.target.value)}
                              placeholder="Enlace URL a la imagen de portada (Opcional)"
                              className="!h-10 !text-[13px] !bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer shrink-0 mt-1"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      ))}

                      {courses.length === 0 && (
                        <p className="text-[12px] text-slate-400 text-center py-4 border border-dashed border-zinc-200 rounded-xl bg-white">
                          Haz clic en "Agregar Curso" para añadir tu primer taller o programa.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center gap-3 mt-8 pt-2">
                  <Button
                    onClick={() => setStep(4)}
                    variant="back"
                  >
                    Atrás
                  </Button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setCourses([]);
                        handleSubmit();
                      }}
                      disabled={loading}
                      className="h-11 px-4 text-[13px] font-jakarta font-semibold text-slate-500 hover:text-black transition cursor-pointer bg-transparent uppercase tracking-wider"
                    >
                      Saltar paso
                    </button>
                    <Button
                      onClick={handleSubmit}
                      variant="primary"
                      disabled={loading || (coursesEnabled && courses.some(c => !c.name || !c.description || !c.url))}
                      className="!w-auto px-6 gap-2"
                    >
                      {loading ? "Enviando..." : "Finalizar Registro"}
                      {!loading && <span className="material-symbols-rounded text-[18px]">arrow_forward</span>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Success / Thank You Screen */}
            {step === 6 && (
              <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300 py-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 text-green-600 animate-bounce">
                  <span className="material-symbols-outlined text-[36px] select-none">
                    verified_user
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-[26px] md:text-[30px] font-bold text-slate-900 font-jakarta leading-tight">
                    ¡Muchas gracias por postularte!
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-400 font-medium font-sans uppercase tracking-widest">
                    Tu solicitud ha sido registrada con éxito.
                  </p>
                </div>

                <div className="text-[14px] text-slate-500 leading-relaxed font-sans max-w-[460px] flex flex-col gap-4 mt-2">
                  <p>
                    Tu postulación para sumarte como especialista en Luminus está en proceso de revisión por nuestro <strong className="text-slate-800 font-bold">Consejo de Expertos</strong> (Review Board).
                  </p>
                  <p>
                    Evaluamos detalladamente cada perfil para asegurar la máxima calidad y alineación con los estándares y valores de nuestra comunidad. Te enviaremos un correo electrónico con la resolución del comité en los próximos días.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/especialistas")}
                  variant="primary"
                  className="w-full md:!w-auto px-8 !h-12 bg-black text-white hover:bg-zinc-900 font-bold font-jakarta text-[13px] uppercase tracking-wider mt-6 !rounded-xl"
                >
                  Volver a la plataforma
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}

function PlacesSearchAutocomplete({
  value: externalValue,
  onChange,
  onPlaceSelect,
  placeholder = "Nombre del espacio o dirección",
  className = "",
  error = false,
  clearOnSelect = false,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onPlaceSelect: (placeId: string, description: string, mainText: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  clearOnSelect?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);

  const {
    ready,
    value,
    suggestions: { status, data: suggestions },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: externalValue || "",
    debounce: 300,
  });

  const lastResolvedValueRef = useRef(externalValue || "");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== lastResolvedValueRef.current) {
      setValue(externalValue, false);
      lastResolvedValueRef.current = externalValue;
    }
  }, [externalValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 240;
        const spaceBelow = window.innerHeight - rect.bottom - 16;
        const spaceAbove = rect.top - 16;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        if (spaceBelow < 120 && spaceAbove > spaceBelow) {
          top = undefined;
          bottom = window.innerHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceAbove);
        } else {
          maxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        maxHeight = Math.max(maxHeight, 100);

        setCoords({
          top,
          bottom,
          left: rect.left,
          width: rect.width,
          maxHeight,
        });
      }
    }
  };

  useEffect(() => {
    if (status === "OK" && suggestions.length > 0) {
      updateCoords();
      const handleScroll = (event: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        clearSuggestions();
      };
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", updateCoords);
      };
    } else {
      setCoords(null);
    }
  }, [status, suggestions]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <InputField
        type="text"
        value={value}
        onChange={(e) => {
          const nextVal = e.target.value;
          setValue(nextVal); // Triggers Google Places suggestions fetch
          lastResolvedValueRef.current = nextVal;
          if (onChange) onChange(nextVal);
        }}
        disabled={!ready}
        placeholder={placeholder}
        className={`w-full ${error ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}`}
      />

      {status === "OK" && suggestions.length > 0 && mounted && coords && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: coords.top !== undefined ? `${coords.top}px` : "auto",
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: `${coords.maxHeight}px`,
            zIndex: 10000,
          }}
          className="bg-white rounded-xl border border-slate-200 overflow-y-auto animate-in fade-in duration-200"
        >
          {suggestions.map(({ place_id, description, structured_formatting }) => (
            <div
              key={place_id}
              onClick={() => {
                const main = structured_formatting?.main_text || description;
                if (clearOnSelect) {
                  setValue("", false);
                  lastResolvedValueRef.current = "";
                  if (onChange) onChange("");
                } else {
                  setValue(description, false);
                  lastResolvedValueRef.current = description;
                }
                clearSuggestions();
                onPlaceSelect(place_id, description, main);
              }}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none flex flex-col min-w-0"
            >
              <span className="text-[13px] font-bold text-slate-900 font-jakarta truncate">
                {structured_formatting?.main_text || description}
              </span>
              <span className="text-[11px] text-slate-500 font-sans truncate">
                {structured_formatting?.secondary_text || ""}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * Automatically resizes and compresses an uploaded image file on the client side using HTML5 Canvas.
 * Converts to WebP format (or JPEG fallback) at high quality (0.82) with max dimensions of 1200x1200px.
 */
async function optimizeImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image element"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(event.target?.result as string);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpDataUrl = canvas.toDataURL("image/webp", quality);
          if (webpDataUrl.startsWith("data:image/webp")) {
            return resolve(webpDataUrl);
          }
        } catch {
          // Fallback to JPEG if browser canvas doesn't support WebP export
        }

        const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(jpegDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
