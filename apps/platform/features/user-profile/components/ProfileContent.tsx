"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  cover_url?: string;
}

function syncProfileToLocalStorage(profile: Profile, email?: string) {
  localStorage.setItem("luminus_profile_firstName", profile.first_name || "");
  localStorage.setItem("luminus_profile_lastName", profile.last_name || "");
  localStorage.setItem("luminus_profile_city", profile.city || "");
  localStorage.setItem("luminus_profile_country", profile.country || "");
  localStorage.setItem("luminus_profile_gender", profile.gender || "");
  localStorage.setItem("luminus_profile_birthdate", profile.birthdate || "");
  localStorage.setItem("luminus_profile_phone", profile.phone_number || "");
  localStorage.setItem("luminus_profile_profession", profile.profession || "");
  localStorage.setItem("luminus_profile_avatar", profile.profile_picture_url || "");
  localStorage.setItem("luminus_profile_interests", JSON.stringify(profile.interests || []));
  localStorage.setItem("luminus_profile_otherInterests", profile.other_interests || "");
  localStorage.setItem("luminus_profile_bio", profile.bio || "");
  localStorage.setItem("luminus_profile_prompts", JSON.stringify(profile.prompts || []));
  localStorage.setItem("luminus_profile_cover", profile.cover_url || "");
  if (email) localStorage.setItem("luminus_user_email", email);
}

export function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/auth/iniciar-sesion");
          return;
        }

        const data = await response.json();
        const loadedProfile = data.profile as Profile;
        setProfile(loadedProfile);
        setCoverUrl(loadedProfile.cover_url || "");
        setEmail(data.email || "");
        syncProfileToLocalStorage(loadedProfile, data.email);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    if (!loading && profile) {
      const editParam = searchParams.get("edit");
      if (editParam) {
        // Wait a frame for the DOM to render the .glow-highlight class, then scroll to it smoothly
        setTimeout(() => {
          const highlightedEl = document.querySelector(".glow-highlight");
          if (highlightedEl) {
            highlightedEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, [loading, profile, searchParams]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/auth/iniciar-sesion");
  };

  const patchProfile = async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Could not save profile.");
    }

    const data = await response.json();
    const savedProfile = data.profile as Profile;
    setProfile(savedProfile);
    setCoverUrl(savedProfile.cover_url || "");
    syncProfileToLocalStorage(savedProfile, data.email);
    return savedProfile;
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
      await patchProfile({ avatarUrl: publicUrl });
      setIsCropping(false);
      setTempImage(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("No pudimos subir tu foto. Intenta nuevamente.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePersonal = async (newData: any) => {
    try {
      await patchProfile(newData);
      setShowEditPersonal(false);
      setFocusedField(null);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("No pudimos guardar tus datos. Intenta nuevamente.");
    }
  };

  const handleOpenEditPersonal = (field?: string) => {
    setFocusedField(field || null);
    setShowEditPersonal(true);
  };

  const handleSaveAbout = async (bio: string) => {
    try {
      await patchProfile({ bio });
      setShowEditAbout(false);
    } catch (error) {
      console.error("Error saving bio:", error);
      alert("No pudimos guardar tu bio. Intenta nuevamente.");
    }
  };

  const handleSaveInterests = async (interests: string[], other_interests: string) => {
    try {
      await patchProfile({ interests, other_interests });
      setShowEditInterests(false);
    } catch (error) {
      console.error("Error saving interests:", error);
      alert("No pudimos guardar tus intereses. Intenta nuevamente.");
    }
  };

  const handleSavePrompts = async (prompts: Prompt[]) => {
    try {
      await patchProfile({ prompts });
      setShowEditPrompts(false);
      setPromptsStep('list');
    } catch (error) {
      console.error("Error saving prompts:", error);
      alert("No pudimos guardar tus reflexiones. Intenta nuevamente.");
    }
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

  const editParam = searchParams.get("edit") || undefined;

  return (
    <div className="w-full flex flex-col relative">

      <ProfileHeaderCover
        coverUrl={coverUrl}
        onChangeCover={() => setShowCoverModal(true)}
        highlight={editParam === "cover"}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-4 lg:pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="w-full h-full bg-transparent pt-4 lg:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 lg:gap-8 items-start">

              {/* LEFT COLUMN */}
              <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 mt-0 md:-mt-[136px] lg:-mt-[224px]">
                <ProfileSidebar
                  profile={profile}
                  onEditPhoto={() => fileInputRef.current?.click()}
                  onEditProfile={handleOpenEditPersonal}
                  onSignOut={handleSignOut}
                  onShowCoverModal={() => setShowCoverModal(true)}
                  coverUrl={coverUrl}
                  highlightField={editParam}
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
              <div className="md:col-span-8 flex flex-col gap-4 lg:gap-6">
                <ProfileAboutSection
                  bio={profile.bio}
                  onEdit={() => setShowEditAbout(true)}
                  firstName={profile.first_name}
                  highlight={editParam === "bio"}
                />

                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  onEdit={() => setShowEditInterests(true)}
                  firstName={profile.first_name}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  onEditPrompts={handleOpenPrompts}
                  firstName={profile.first_name}
                  highlight={editParam === "prompts"}
                />

                {/* Mobile Only Membership */}
                <div className="md:hidden flex flex-col gap-4">
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
          patchProfile({ coverUrl: url }).catch((error) => {
            console.error("Error saving cover:", error);
            alert("No pudimos guardar tu portada. Intenta nuevamente.");
          });
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
