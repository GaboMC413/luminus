"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileButton } from "@/components/ui/Button";
import { PhotoEditor } from "@/features/auth/registration/PhotoEditor";
import { Prompt } from "./ProfilePrompts";

// Modals
import { EditPersonalInfoModal } from "../modals/EditPersonalInfoModal";
import { EditAboutModal } from "../modals/EditAboutModal";
import { EditInterestsModal } from "../modals/EditInterestsModal";
import { EditPromptsModal } from "../modals/EditPromptsModal";
import { CoverSelectorModal } from "../modals/CoverSelectorModal";

// Sub-components
import { ProfileHeaderCover } from "./ProfileHeaderCover";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ProfileInterestsSection } from "./ProfileInterestsSection";
import { ProfileMembershipCard } from "./ProfileMembershipCard";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { uploadAvatar } from "@/lib/uploadAvatar";

export interface Profile {
  first_name: string;
  last_name: string;
  city: string;
  country: string;
  profession: string;
  interests: string[];
  prompts: Prompt[];
  profile_picture_url: string;
  gender: string;
  birthdate: string;
  phone_number: string;
  selected_plan: string;
  created_at: string;
  bio?: string;
  other_interests?: string;
}

export function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState("");

  // Modal states
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditPersonal, setShowEditPersonal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showEditAbout, setShowEditAbout] = useState(false);
  const [showEditInterests, setShowEditInterests] = useState(false);
  const [showEditPrompts, setShowEditPrompts] = useState(false);
  const [promptsStep, setPromptsStep] = useState<'list' | 'select'>('list');

  // Image editing states
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from local storage or fallback to mock data
    const storedFirstName = localStorage.getItem("luminus_profile_firstName") || "";
    const storedLastName = localStorage.getItem("luminus_profile_lastName") || "";
    const storedCity = localStorage.getItem("luminus_profile_city") || "";
    const storedCountry = localStorage.getItem("luminus_profile_country") || "";
    const storedPhone = localStorage.getItem("luminus_profile_phone") || "";
    const storedGender = localStorage.getItem("luminus_profile_gender") || "";
    const storedBirthdate = localStorage.getItem("luminus_profile_birthdate") || "";
    const storedAvatar = localStorage.getItem("luminus_profile_avatar") || "";
    const storedProfession = localStorage.getItem("luminus_profile_profession") || "";

    let storedInterests: string[] = [];
    try {
      const parsed = localStorage.getItem("luminus_profile_interests");
      if (parsed) storedInterests = JSON.parse(parsed);
    } catch (e) { }

    const storedOtherInterests = localStorage.getItem("luminus_profile_otherInterests") || "";
    const storedBio = localStorage.getItem("luminus_profile_bio") || "";

    let storedPrompts: Prompt[] = [];
    try {
      const parsedPrompts = localStorage.getItem("luminus_profile_prompts");
      if (parsedPrompts) storedPrompts = JSON.parse(parsedPrompts);
    } catch (e) { }

    setProfile({
      first_name: storedFirstName,
      last_name: storedLastName,
      city: storedCity,
      country: storedCountry,
      profession: storedProfession,
      interests: storedInterests,
      prompts: storedPrompts,
      profile_picture_url: storedAvatar,
      gender: storedGender,
      birthdate: storedBirthdate,
      phone_number: storedPhone,
      selected_plan: "Mensual",
      created_at: new Date().toISOString(),
      bio: storedBio,
      other_interests: storedOtherInterests
    });
    setCoverUrl(localStorage.getItem("luminus_profile_cover") || "");
    setEmail(localStorage.getItem("luminus_user_email") || "");
    setLoading(false);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/auth/signin");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImage(null);
  };

  const handleCropSave = async (croppedImage: Blob) => {
    try {
      setIsUploadingAvatar(true);
      const { publicUrl } = await uploadAvatar(croppedImage);
      await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });
      setProfile(prev => prev ? { ...prev, profile_picture_url: publicUrl } : null);
      localStorage.setItem("luminus_profile_avatar", publicUrl);
      setIsCropping(false);
      setTempImage(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("No pudimos subir tu foto. Intenta nuevamente.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePersonal = (newData: any) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      // Synchronize to localStorage so onboarding is fully reactive
      localStorage.setItem("luminus_profile_firstName", updated.first_name);
      localStorage.setItem("luminus_profile_lastName", updated.last_name);
      localStorage.setItem("luminus_profile_city", updated.city);
      localStorage.setItem("luminus_profile_country", updated.country);
      localStorage.setItem("luminus_profile_gender", updated.gender);
      localStorage.setItem("luminus_profile_birthdate", updated.birthdate);
      localStorage.setItem("luminus_profile_phone", updated.phone_number);
      localStorage.setItem("luminus_profile_profession", updated.profession);
      return updated;
    });
    setShowEditPersonal(false);
    setFocusedField(null);
  };

  const handleOpenEditPersonal = (field?: string) => {
    setFocusedField(field || null);
    setShowEditPersonal(true);
  };

  const handleSaveAbout = (bio: string) => {
    setProfile(prev => prev ? { ...prev, bio } : null);
    localStorage.setItem("luminus_profile_bio", bio);
    setShowEditAbout(false);
  };

  const handleSaveInterests = (interests: string[], other_interests: string) => {
    setProfile(prev => prev ? { ...prev, interests, other_interests } : null);
    localStorage.setItem("luminus_profile_interests", JSON.stringify(interests));
    localStorage.setItem("luminus_profile_otherInterests", other_interests);
    setShowEditInterests(false);
  };

  const handleSavePrompts = (prompts: Prompt[]) => {
    setProfile(prev => prev ? { ...prev, prompts } : null);
    localStorage.setItem("luminus_profile_prompts", JSON.stringify(prompts));
    setShowEditPrompts(false);
    setPromptsStep('list');
  };

  const handleOpenPrompts = (step: 'list' | 'select' = 'list') => {
    setPromptsStep(step);
    setShowEditPrompts(true);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-float">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] opacity-80 invert brightness-0" />
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold animate-pulse-slow">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="w-full flex flex-col relative">

      <ProfileHeaderCover
        coverUrl={coverUrl}
        onChangeCover={() => setShowCoverModal(true)}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="w-full h-full bg-transparent pt-2 lg:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 lg:gap-8 items-start">

              {/* LEFT COLUMN */}
              <div className="md:col-span-4 flex flex-col gap-2 lg:gap-6 mt-2 md:-mt-[136px] lg:-mt-[224px]">
                <ProfileSidebar
                  profile={profile}
                  onEditPhoto={() => fileInputRef.current?.click()}
                  onEditProfile={handleOpenEditPersonal}
                  onSignOut={handleSignOut}
                  onShowCoverModal={() => setShowCoverModal(true)}
                  coverUrl={coverUrl}
                />

                <div className="hidden md:flex flex-col gap-4 lg:gap-6">
                  <ProfileMembershipCard plan={profile.selected_plan} createdAt={profile.created_at} />
                  <button
                    onClick={handleSignOut}
                    className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] bg-transparent border-none outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-red-500">logout</span>
                    <span className="font-semibold text-slate-400 group-hover:text-red-500">Cerrar sesión</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="md:col-span-8 flex flex-col gap-2 lg:gap-6">
                <ProfileAboutSection
                  bio={profile.bio}
                  onEdit={() => setShowEditAbout(true)}
                />

                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  onEdit={() => setShowEditInterests(true)}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  onEditPrompts={handleOpenPrompts}
                />

                {/* Mobile Only Membership */}
                <div className="md:hidden flex flex-col gap-2">
                  <ProfileMembershipCard
                    plan={profile.selected_plan}
                    createdAt={profile.created_at}
                    showSettingsButtons={true}
                  />

                  <div className="w-full flex justify-center pt-2">
                    <button
                      onClick={handleSignOut}
                      className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-[14px] bg-transparent border-none outline-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-red-500">logout</span>
                      <span className="font-semibold text-slate-400 group-hover:text-red-500">Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp, .png, .jpg, .jpeg, .webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Modals & Editors */}
      {isCropping && tempImage && (
        <PhotoEditor
          image={tempImage}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}

      <CoverSelectorModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        currentCover={coverUrl}
        onSelect={(url) => {
          setCoverUrl(url);
          localStorage.setItem("luminus_profile_cover", url);
          setShowCoverModal(false);
        }}
      />

      {showEditPersonal && (
        <EditPersonalInfoModal
          isOpen={showEditPersonal}
          onClose={() => {
            setShowEditPersonal(false);
            setFocusedField(null);
          }}
          onSave={handleSavePersonal}
          initialData={profile}
          initialFocusField={focusedField}
        />
      )}

      {showEditAbout && (
        <EditAboutModal
          isOpen={showEditAbout}
          onClose={() => setShowEditAbout(false)}
          onSave={handleSaveAbout}
          initialBio={profile.bio || ""}
        />
      )}

      {showEditInterests && (
        <EditInterestsModal
          isOpen={showEditInterests}
          onClose={() => setShowEditInterests(false)}
          onSave={handleSaveInterests}
          initialInterests={profile.interests || []}
          initialOtherInterests={profile.other_interests || ""}
        />
      )}

      {showEditPrompts && (
        <EditPromptsModal
          isOpen={showEditPrompts}
          onClose={() => {
            setShowEditPrompts(false);
            setPromptsStep('list');
          }}
          onSave={handleSavePrompts}
          initialPrompts={profile.prompts || []}
          initialStep={promptsStep}
        />
      )}
    </div>
  );
}
