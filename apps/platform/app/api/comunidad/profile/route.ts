import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { MOCK_USERS } from "@/utils/constants";

export const runtime = "nodejs";

function getMockProfileForId(id: string) {
  const index = parseInt(id.replace("mock-user-", ""));
  const mockUser = MOCK_USERS[index] || MOCK_USERS[0];
  
  const nameParts = mockUser.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const locationParts = mockUser.location.split(",");
  const city = locationParts[0]?.trim() || "";
  const country = locationParts[1]?.trim() || "";
  const isFemale = mockUser.avatar.includes("women") || mockUser.name.endsWith("a") || mockUser.name === "Nancy Núñez";
  const gender = isFemale ? "Femenino" : "Masculino";

  const coverPhotos = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&fit=crop",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&fit=crop",
    "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=1200&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&fit=crop"
  ];
  const coverUrl = coverPhotos[mockUser.name.length % coverPhotos.length];

  let profession = "Especialista en Bienestar";
  let bio = `Apasionado por el desarrollo humano y por vivir una vida plena, consciente y en equilibrio.`;

  if (mockUser.interests.includes("Yoga y Pilates") || mockUser.interests.includes("Meditación")) {
    profession = isFemale ? "Instructora de Yoga & Meditación" : "Instructor de Yoga & Meditación";
    bio = `Dedico mi vida a compartir herramientas de calma mental, respiración consciente y movimiento integral.`;
  } else if (mockUser.interests.includes("Nutrición diaria") || mockUser.interests.includes("Alimentación consciente")) {
    profession = "Nutricionista Integral";
    bio = `Ayudo a las personas a sanar su relación con la comida a través de hábitos conscientes y alimentación integral.`;
  } else if (mockUser.interests.includes("Gestión emocional") || mockUser.interests.includes("Autoconocimiento")) {
    profession = "Terapeuta Emocional & Coach";
    bio = `Acompaño procesos de autoconocimiento, gestión emocional y construcción de relaciones saludables con el entorno.`;
  } else if (mockUser.name === "Nancy Núñez") {
    profession = "Fotógrafa y Creadora Visual";
    bio = "Apasionada por capturar la esencia de la vida a través de la fotografía y vivir en conexión con la naturaleza.";
  }

  return {
    first_name: firstName,
    last_name: lastName,
    city: city,
    country: country,
    profession: profession,
    interests: mockUser.interests,
    profile_picture_url: mockUser.avatar,
    gender: gender,
    birthdate: "1993-06-15",
    phone_number: "+51 987 654 321",
    selected_plan: "Mensual",
    created_at: "2024-01-15T12:00:00.000Z",
    bio: bio,
    other_interests: "Crecimiento integral",
    cover_url: coverUrl,
    prompts: [
      {
        question: "Mi objetivo de vida es…",
        answer: mockUser.interests.includes("Calma interior") 
          ? "Vivir con más calma, claridad y propósito de vida." 
          : "Cuidar mi bienestar mientras crezco personal y profesionalmente."
      },
      {
        question: "Hoy estoy buscando…",
        answer: "Conectar con personas que estén en un proceso de crecimiento similar."
      }
    ]
  };
}

export async function GET(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID de usuario requerido." }, { status: 400 });
  }

  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!process.env.DATABASE_URL && !useMockData) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured and NEXT_PUBLIC_USE_MOCK_DATA is not enabled." 
    }, { status: 500 });
  }

  // Handle mock fallback directly if ID starts with mock-user
  if (id.startsWith("mock-user-")) {
    return NextResponse.json({ profile: getMockProfileForId(id) });
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
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
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
      }
    });
  } catch (error) {
    console.error("Public profile read failed.", error);
    
    if (useMockData) {
      console.warn("Database error, falling back to mock profile.");
      return NextResponse.json({ profile: getMockProfileForId(id) });
    }
    
    return NextResponse.json({ 
      message: "No se pudo cargar el perfil público. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
