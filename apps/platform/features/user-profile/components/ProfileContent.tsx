"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Copy, Check } from "lucide-react";
import { PhotoEditor } from "@/components/ui/PhotoEditor";
import { Prompt } from "./ProfilePrompts";

// Modals
import { EditPersonalInfoModal } from "../modals/EditPersonalInfoModal";
import { EditAboutModal } from "../modals/EditAboutModal";
import { EditInterestsModal } from "../modals/EditInterestsModal";
import { EditPromptsModal } from "../modals/EditPromptsModal";
import { CoverSelectorModal } from "../modals/CoverSelectorModal";

// Sub-components
import { ProfileHeroHeader } from "./ProfileHeroHeader";
import { SpecialistProfileView } from "./SpecialistProfileView";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { ProfileInterestsSection } from "./ProfileInterestsSection";
import { ProfileMembershipCard } from "./ProfileMembershipCard";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { uploadAvatar } from "@/lib/uploadAvatar";

export interface Profile {
  id?: string;
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
  member_since?: string | null;
  tier?: string;
  bio?: string;
  other_interests?: string;
  cover_url?: string;
  specialistProfile?: any;
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

  // Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ isOpen: boolean; title: string; message?: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

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
        if (editParam === "interests" || editParam === "intereses") {
          setShowEditInterests(true);
        } else if (editParam === "bio") {
          setShowEditAbout(true);
        } else if (editParam === "prompts") {
          setShowEditPrompts(true);
        } else if (editParam === "cover") {
          setShowCoverModal(true);
        } else if (editParam === "personal") {
          setShowEditPersonal(true);
        }
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
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));

    if (data?.cognitoLogoutUrl) {
      window.location.href = data.cognitoLogoutUrl;
    } else {
      router.push("/auth/iniciar-sesion");
    }
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
      setToast({
        isOpen: true,
        title: "Foto actualizada",
        message: "Foto de perfil actualizada correctamente.",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setToast({
        isOpen: true,
        title: "Error",
        message: "No pudimos subir tu foto. Intenta nuevamente.",
        type: "error",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePersonal = async (newData: any) => {
    try {
      await patchProfile(newData);
      setShowEditPersonal(false);
      setFocusedField(null);
      setToast({
        isOpen: true,
        title: "Perfil actualizado",
        message: "Información personal actualizada.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setToast({
        isOpen: true,
        title: "Error",
        message: "No pudimos guardar tus datos. Intenta nuevamente.",
        type: "error",
      });
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
      setToast({
        isOpen: true,
        title: "Biografía actualizada",
        message: "Biografía guardada.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving bio:", error);
      setToast({
        isOpen: true,
        title: "Error",
        message: "No pudimos guardar tu biografía. Intenta nuevamente.",
        type: "error",
      });
    }
  };

  const handleSaveInterests = async (interests: string[], other_interests: string) => {
    try {
      await patchProfile({ interests, other_interests });
      setShowEditInterests(false);
      setToast({
        isOpen: true,
        title: "Intereses actualizados",
        message: "Intereses actualizados.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving interests:", error);
      setToast({
        isOpen: true,
        title: "Error",
        message: "No pudimos guardar tus intereses. Intenta nuevamente.",
        type: "error",
      });
    }
  };

  const handleSavePrompts = async (prompts: Prompt[]) => {
    try {
      await patchProfile({ prompts });
      setShowEditPrompts(false);
      setPromptsStep('list');
      setToast({
        isOpen: true,
        title: "Reflexiones actualizadas",
        message: "Reflexiones guardadas.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving prompts:", error);
      setToast({
        isOpen: true,
        title: "Error",
        message: "No pudimos guardar tus reflexiones. Intenta nuevamente.",
        type: "error",
      });
    }
  };

  const handleOpenPrompts = (step: 'list' | 'select' = 'list') => {
    setPromptsStep(step);
    setShowEditPrompts(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const publicUrl = `${window.location.origin}/inicio/public-profile?id=${profile?.id || ""}`;
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) return null;

  const editParam = searchParams.get("edit") || undefined;
  const effectiveProfile = {
    ...profile,
    is_own_profile: true,
    cover_url: coverUrl || profile.cover_url,
  };

  return (
    <div className="w-full flex flex-col relative bg-slate-50 min-h-screen font-sans">
      {profile.specialistProfile ? (
        <SpecialistProfileView
          profile={effectiveProfile}
          isPublic={false}
          onEditProfile={() => handleOpenEditPersonal()}
          onEditPhoto={() => fileInputRef.current?.click()}
          onEditCover={() => setShowCoverModal(true)}
          onEditBio={() => setShowEditAbout(true)}
          onEditInterests={() => setShowEditInterests(true)}
          onEditPrompts={handleOpenPrompts}
          onShareProfile={() => setIsShareOpen(true)}
          membershipCard={
            <ProfileMembershipCard
              plan={profile.selected_plan}
              createdAt={profile.created_at}
              memberSince={profile.member_since}
              tier={profile.tier}
              showSettingsButtons={true}
            />
          }
          onSignOut={handleSignOut}
        />
      ) : (
        <div className="w-full flex flex-col font-sans">
          {/* Master Profile Hero Header */}
          <ProfileHeroHeader
            profile={effectiveProfile}
            isSpecialist={false}
            isOwnProfile={true}
            onEditProfile={() => handleOpenEditPersonal()}
            onEditPhoto={() => fileInputRef.current?.click()}
            onEditCover={() => setShowCoverModal(true)}
            onShareProfile={() => setIsShareOpen(true)}
          />

          {/* Balanced 8:4 Grid Content for Member */}
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 mt-5 lg:mt-6 items-start">
              {/* MAIN COLUMN (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                <ProfileAboutSection
                  bio={profile.bio}
                  onEdit={() => setShowEditAbout(true)}
                  firstName={profile.first_name}
                  highlight={editParam === "bio"}
                  isPublic={false}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  onEditPrompts={handleOpenPrompts}
                  firstName={profile.first_name}
                  highlight={editParam === "prompts"}
                  isPublic={false}
                />
              </div>

              {/* SIDEBAR COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  onEdit={() => setShowEditInterests(true)}
                  firstName={profile.first_name}
                  highlight={editParam === "interests" || editParam === "intereses"}
                  isPublic={false}
                />

                <ProfileMembershipCard
                  plan={profile.selected_plan}
                  createdAt={profile.created_at}
                  memberSince={profile.member_since}
                  tier={profile.tier}
                  showSettingsButtons={true}
                />

                <div className="w-full flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="group flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors bg-transparent border-none outline-none cursor-pointer"
                  >
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Avatar Upload */}
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
          patchProfile({ coverUrl: url })
            .then(() => {
              setToast({
                isOpen: true,
                title: "Portada actualizada",
                message: "Portada actualizada correctamente.",
                type: "success",
              });
            })
            .catch((error) => {
              console.error("Error saving cover:", error);
              setToast({
                isOpen: true,
                title: "Error",
                message: "No pudimos guardar tu portada. Intenta nuevamente.",
                type: "error",
              });
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

      {/* Share Profile Modal */}
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Compartir perfil"
        maxWidth="420px"
      >
        <div className="flex flex-col gap-4 font-sans pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? `${window.location.origin}/inicio/public-profile?id=${profile?.id || ""}` : ""}
              className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-600 outline-none select-all font-sans"
            />
            <Button
              onClick={handleCopyLink}
              variant={copied ? "primary" : "secondary"}
              className="gap-1.5 text-xs shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </Button>
          </div>
          <p className="text-[12px] text-slate-400 leading-normal">
            Copia este enlace para que otros miembros puedan ver tu perfil en la comunidad.
          </p>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
