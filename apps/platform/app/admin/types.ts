export type AdminUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "active" | "disabled" | "deleted";
  emailVerified: boolean;
  authProvider: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl: string;
    profession: string;
    city: string;
    country: string;
    phoneNumber: string;
    gender: string;
    birthdate: string;
    bio: string;
    intention: string;
    selectedPlan: string;
    isOnboarded: boolean;
  };
  interests: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
  }>;
  prompts?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
};

export type AdminChat = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  user1: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
  } | null;
  user2: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
  } | null;
  lastMessage: {
    body: string;
    createdAt: string | null;
  } | null;
  messagesCount: number;
  messages: Array<{
    id: string;
    body: string;
    senderId: string;
    createdAt: string | null;
  }>;
};

export type AdminLog = {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatarUrl: string;
    };
  };
};

export type AdminEmailLog = {
  id: string;
  recipient: string;
  subject: string;
  htmlBody: string;
  status?: string | null;
  messageId?: string | null;
  errorDetails?: string | null;
  metadata?: string | null;
  createdAt: string;
};

export type AdminSearch = {
  id: string;
  userId: string;
  query: string;
  createdAt: string;
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatarUrl: string;
    };
  };
};

export type AdminSpecialist = {
  userId: string;
  specialty: string;
  title: string;
  clinicName: string;
  bio: string;
  linkedinUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  institution: string | null;
  selectedAreas: any;
  resumeUrl: string | null;
  spaces?: any[];
  courses?: any[];
  createdAt: string;
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatarUrl: string;
      city?: string;
    };
  };
};

export type AdminPostulation = {
  id: string;
  userId: string;
  specialty: string;
  title: string;
  clinicName: string;
  bio: string;
  linkedinUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  institution: string | null;
  selectedAreas: any;
  resumeUrl: string | null;
  clinicData?: any;
  sessionsData?: any;
  courses?: any;
  status: string;
  createdAt: string;
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatarUrl: string;
      city?: string;
    };
  };
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconFilled: boolean;
  color: string;
  bgColor: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  interests: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  }>;
  specialistAreas: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  }>;
};

export type AdminSuggestion = {
  id: string;
  type: "USER_INTEREST" | "SPECIALIST_AREA";
  name: string;
  status: "pending" | "approved" | "rejected";
  userId: string | null;
  categoryId: string | null;
  createdAt: string;
  user: {
    email: string;
    fullName: string;
  } | null;
  categoryName: string | null;
};

export type AdminEvent = {
  id: string;
  youtubeId: string | null;
  slug: string | null;
  title: string;
  description: string;
  date: string | null;
  timeText: string | null;
  location: string | null;
  speakerName: string | null;
  speakerBio: string | null;
  category: string | null;
  coverUrl: string | null;
  link: string | null;
  isUpcoming: boolean;
  liveNotificationSent?: boolean;
  liveNotificationSentAt?: string | null;
  createdAt: string;
  inscriptionsCount?: number;
};

export type AdminEventInscription = {
  id: string;
  eventId: string;
  userId?: string | null;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  guestEmail?: string | null;
  guestCity?: string | null;
  guestState?: string | null;
  guestCountry?: string | null;
  marketingConsent?: boolean;
  notifiedLiveAt?: string | null;
  notifiedLiveStatus?: string | null;
  createdAt: string;
  user?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      fullName?: string;
      avatarUrl?: string;
    };
  };
};

export type AdminContactMessage = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  pais: string | null;
  motivo: string;
  mensaje: string;
  createdAt: string;
};

export type AdminTab =
  | "usuarios"
  | "chats"
  | "soporte"
  | "logs"
  | "busquedas"
  | "especialistas"
  | "emails"
  | "categorias"
  | "eventos"
  | "contacto";

