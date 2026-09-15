import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";

const MOCK_PROFILES: Record<string, any> = {
  "mock-lucia": {
    first_name: "Lucía",
    last_name: "Fernández",
    city: "Colonia",
    country: "Uruguay",
    profession: "Instructora de Yoga & Pilates",
    interests: ["Movimiento Físico", "Yoga", "Entrenamiento", "Pilates"],
    prompts: [
      { question: "¿Qué te inspira en tu práctica diaria?", answer: "Conectar con el cuerpo y el momento presente a través del movimiento consciente." },
      { question: "Un hábito que transformó tu vida", answer: "Comenzar las mañanas con 15 minutos de respiración y estiramiento." }
    ],
    profile_picture_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    cover_url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    gender: "female",
    birthdate: "1994-05-18",
    phone_number: "+598 99 123 456",
    selected_plan: "Mensual",
    created_at: "2026-01-15T10:00:00.000Z",
    bio: "Instructora apasionada por el movimiento consciente, el yoga dinámico y el bienestar postural. Guiando clases grupales y personalizadas.",
    other_interests: "Amante de la naturaleza, la meditación al aire libre y la alimentación basada en plantas.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
  "mock-valeria": {
    first_name: "Dra. Valeria",
    last_name: "Gómez",
    city: "Montevideo",
    country: "Uruguay",
    profession: "Especialista en Salud Integral",
    interests: ["Salud Integral", "Bienestar Emocional", "Sueño", "Longevidad"],
    prompts: [
      { question: "¿Cuál es tu enfoque de bienestar?", answer: "La salud es un equilibrio entre cuerpo, mente y entorno; pequeñas elecciones diarias generan grandes cambios." }
    ],
    profile_picture_url: "https://images.unsplash.com/photo-1594824813501-48995a9477e5?auto=format&fit=crop&w=600&q=80",
    cover_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    gender: "female",
    birthdate: "1988-11-20",
    phone_number: "+598 98 765 432",
    selected_plan: "Anual",
    created_at: "2026-02-01T10:00:00.000Z",
    bio: "Médica dedicada a la medicina integrativa, ritmos circadianos y optimización de hábitos saludables.",
    other_interests: "Investigación en neurociencias y medicina del estilo de vida.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
  "mock-santiago": {
    first_name: "Santiago",
    last_name: "Morales",
    city: "Montevideo",
    country: "Uruguay",
    profession: "Miembro de la Comunidad",
    interests: ["Bienestar Emocional", "Comunidad", "Mindfulness"],
    prompts: [],
    profile_picture_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
    cover_url: "",
    gender: "male",
    birthdate: "1992-03-12",
    phone_number: "+598 94 332 110",
    selected_plan: "Mensual",
    created_at: "2026-03-10T10:00:00.000Z",
    bio: "Explorando hábitos de meditación y compartiendo experiencias en la comunidad.",
    other_interests: "Lectura, música acústica y deportes al aire libre.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
  "mock-martin": {
    first_name: "Lic. Martín",
    last_name: "Navarro",
    city: "Buenos Aires",
    country: "Argentina",
    profession: "Psicólogo & Coach Emocional",
    interests: ["Crecimiento Personal", "Autoconocimiento", "Hábitos", "Resiliencia"],
    prompts: [
      { question: "Un consejo para los momentos difíciles", answer: "Acepta la emoción sin juzgarla, respira y recuerda que ninguna tormenta es permanente." }
    ],
    profile_picture_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    cover_url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
    gender: "male",
    birthdate: "1985-09-08",
    phone_number: "+54 11 4455 6677",
    selected_plan: "Anual",
    created_at: "2026-01-20T10:00:00.000Z",
    bio: "Psicólogo clínico y facilitador de talleres de inteligencia emocional y mindfulness laboral.",
    other_interests: "Escritura, senderismo y filosofía estoica.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
  "mock-camila": {
    first_name: "Camila",
    last_name: "Rivas",
    city: "Buenos Aires",
    country: "Argentina",
    profession: "Miembro de la Comunidad",
    interests: ["Crecimiento Personal", "Autocuidado", "Cocina"],
    prompts: [],
    profile_picture_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    cover_url: "",
    gender: "female",
    birthdate: "1996-07-25",
    phone_number: "+54 11 9876 5432",
    selected_plan: "Mensual",
    created_at: "2026-04-05T10:00:00.000Z",
    bio: "Interesada en el desarrollo personal y las prácticas de bienestar diario.",
    other_interests: "Arte y alimentación natural.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
  "mock-elena": {
    first_name: "Elena",
    last_name: "Benítez",
    city: "Punta del Este",
    country: "Uruguay",
    profession: "Nutricionista Holística",
    interests: ["Nutrición", "Alimentación consciente", "Cocina", "Salud digestiva"],
    prompts: [
      { question: "Tu filosofía en la cocina", answer: "Comer con los sentidos, honrar los ingredientes reales y disfrutar de cada bocado sin culpas." }
    ],
    profile_picture_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    cover_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    gender: "female",
    birthdate: "1990-12-14",
    phone_number: "+598 91 223 344",
    selected_plan: "Anual",
    created_at: "2026-02-12T10:00:00.000Z",
    bio: "Nutricionista especializada en alimentación antiinflamatoria, salud hormonal y cocina saludable.",
    other_interests: "Huerta orgánica y fermentación.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
  "mock-gonzalo": {
    first_name: "Dr. Gonzalo",
    last_name: "Varela",
    city: "Montevideo",
    country: "Uruguay",
    profession: "Médico & Terapeuta",
    interests: ["Salud Integral", "Prevención", "Bienestar corporal", "Respiración"],
    prompts: [
      { question: "¿Por qué la respiración?", answer: "Es el puente directo hacia nuestro sistema nervioso autónomo; cambiar cómo respiras cambia cómo sientes." }
    ],
    profile_picture_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    cover_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    gender: "male",
    birthdate: "1982-04-19",
    phone_number: "+598 99 887 766",
    selected_plan: "Anual",
    created_at: "2026-01-10T10:00:00.000Z",
    bio: "Médico enfocado en terapias complementarias, manejo de ansiedad y técnicas somáticas.",
    other_interests: "Meditación Zen, natación y biofeedback.",
    connection_status: null,
    connection_direction: null,
    is_own_profile: false,
  },
};

export async function GET(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Official account profile is disabled
  if (id === "mock-luminus" || id === "50d13047-bab8-44f1-9541-a821113845cc") {
    return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 404 });
  }

  // Check mock profiles first
  if (id && MOCK_PROFILES[id]) {
    return NextResponse.json({ profile: MOCK_PROFILES[id] });
  }

  if (id) {
    const foundMock = Object.values(MOCK_PROFILES).find((m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase() === id.toLowerCase() ||
      m.first_name.toLowerCase() === id.toLowerCase()
    );
    if (foundMock) {
      return NextResponse.json({ profile: foundMock });
    }
  }

  if (!id || !isUuid(id)) {
    return NextResponse.json({ message: "ID de usuario inválido." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured." 
    }, { status: 500 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        interests: {
          include: {
            interest: true,
          },
        },
        profilePrompts: {
          orderBy: { sortOrder: "asc" },
        },
        specialistProfile: {
          include: {
            courses: {
              where: { isActive: true },
            },
            spaces: {
              where: { isActive: true },
              include: {
                category: true,
                services: true,
                availability: {
                  where: { isActive: true },
                  orderBy: { dayOfWeek: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "active" || user.email === "info@luminuslatam.com") {
      return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 404 });
    }

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId: id },
          { requesterId: id, recipientId: session.userId },
        ],
      },
      select: {
        id: true,
        requesterId: true,
        status: true,
      },
    });

    if (connection && connection.status === "blocked" && connection.requesterId === id) {
      return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 403 });
    }

    const profile = (user.profile ?? {}) as any;
    const prompts = (user.profilePrompts ?? [])
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((prompt: any) => ({
        question: prompt.question,
        answer: prompt.answer,
      }));

    return NextResponse.json({
      profile: {
        first_name: profile.firstName ?? "",
        last_name: profile.lastName ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        profession: profile.profession ?? "",
        interests: (user.interests ?? []).map((row: any) => row.interest.name),
        prompts,
        profile_picture_url: profile.avatarUrl ?? "",
        cover_url: profile.coverUrl ?? "",
        gender: profile.gender ?? "",
        birthdate: profile.birthdate ? new Date(profile.birthdate).toISOString().slice(0, 10) : "",
        phone_number: profile.phoneNumber ?? "",
        selected_plan: profile.selectedPlan ?? "Mensual",
        created_at: profile.createdAt?.toISOString?.() ?? user.createdAt?.toISOString?.() ?? "",
        bio: profile.bio ?? "",
        other_interests: profile.intention ?? "",
        connection_status: connection?.status ?? null,
        connection_direction: connection ? (connection.requesterId === session.userId ? "outgoing" : "incoming") : null,
        is_own_profile: id === session.userId,
        specialistProfile: user.specialistProfile || null,
      }
    });
  } catch (error) {
    console.error("Public profile read failed.", error);
    return NextResponse.json({ 
      message: "No se pudo cargar el perfil público. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
