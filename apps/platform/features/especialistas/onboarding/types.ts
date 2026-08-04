export interface SocialLink {
  platform: string;
  url: string;
}

export interface CourseItem {
  name: string;
  type?: string;
  description: string;
  modality?: string;
  url: string;
  coverUrl?: string;
  institution?: string;
}

export interface PlaceDetails {
  placeId: string;
  description: string;
  mainText: string;
}

export interface SpaceServiceItem {
  name: string;
  categoryName: string;
  isCustom?: boolean;
}

export interface OnboardingPayload {
  specialty: string;
  title: string;
  bio: string;
  clinicType: string | null;
  clinicName: string | null;
  clinicAddress: string | null;
  clinicCity: string | null;
  clinicCountry: string | null;
  clinicLat: number | null;
  clinicLng: number | null;
  googlePlaceId: string | null;
  googleMapsUrl: string | null;
  clinicPhone: string | null;
  clinicWebsite: string | null;
  clinicCoverUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  courses: CourseItem[];
}

