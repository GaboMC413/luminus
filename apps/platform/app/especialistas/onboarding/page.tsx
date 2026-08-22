"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES, Country } from "@/utils/countries";
import { OnboardingSidebar } from "@/features/especialistas/onboarding/components/OnboardingSidebar";
import { Step1Intro } from "@/features/especialistas/onboarding/components/Step1Intro";
import { Step2Profile } from "@/features/especialistas/onboarding/components/Step2Profile";
import { Step3Sessions } from "@/features/especialistas/onboarding/components/Step3Sessions";
import { Step4Spaces, SPACE_TYPE_OPTIONS } from "@/features/especialistas/onboarding/components/Step4Spaces";
import { Step5Courses } from "@/features/especialistas/onboarding/components/Step5Courses";
import { OnboardingSuccessModal } from "@/features/especialistas/onboarding/components/OnboardingSuccessModal";
import { ApplicationStatusView } from "@/features/especialistas/onboarding/components/ApplicationStatusView";
import { SocialLink, CourseItem } from "@/features/especialistas/onboarding/types";
import { uploadResume } from "@/lib/uploadResume";

const specialtyOptions = [
  "Crecimiento personal",
  "Bienestar emocional",
  "Salud integral",
  "Movimiento físico",
  "Nutrición",
  "Espiritualidad",
  "Vínculos",
  "Terapias complementarias",
];

interface AppStatusData {
  hasApplication: boolean;
  status: string | null;
  createdAt?: string | null;
  email?: string | null;
}

export default function SpecialistOnboardingPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wizard State
  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [appStatus, setAppStatus] = useState<AppStatusData | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  // Check application status on mount
  useEffect(() => {
    async function checkAppStatus() {
      try {
        const res = await fetch("/api/especialistas/application-status");
        if (res.ok) {
          const data = await res.json();
          setAppStatus(data);
        }
      } catch (err) {
        console.error("Error checking application status:", err);
      } finally {
        setCheckingStatus(false);
      }
    }
    checkAppStatus();
  }, []);

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
    setMaxVisitedStep((prev) => Math.max(prev, targetStep));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 1 State
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2 State
  const [specialty, setSpecialty] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ platform: "", url: "" }]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Step 3 State
  const [sessionsChoice, setSessionsChoice] = useState<"yes" | "no" | null>(null);
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeZone, setTimeZone] = useState("");

  // Step 4 State
  const [clinicChoice, setClinicChoice] = useState<"yes" | "no" | null>(null);
  const [clinicEnabled, setClinicEnabled] = useState(false);
  const [spaceType, setSpaceType] = useState("");
  const [customSpaceType, setCustomSpaceType] = useState("");
  const [spaceCategories, setSpaceCategories] = useState<string[]>([]);
  const [spaceServices, setSpaceServices] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState("");
  const [clinicDescription, setClinicDescription] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicWebsite, setClinicWebsite] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const [suggestedPhotos, setSuggestedPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [photoAttribution, setPhotoAttribution] = useState<string>("");

  // Step 5 State
  const [coursesChoice, setCoursesChoice] = useState<"yes" | "no" | null>(null);
  const [coursesEnabled, setCoursesEnabled] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);

  // Reset scroll on step change
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Submission handler
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let uploadedResume: Awaited<ReturnType<typeof uploadResume>> | null = null;
      if (resumeFile) {
        try {
          uploadedResume = await uploadResume(resumeFile);
        } catch (uploadErr: any) {
          console.error("Resume upload failed:", uploadErr);
          alert(uploadErr.message || "Error al subir el currículum. Por favor intenta de nuevo.");
          setLoading(false);
          return;
        }
      }

      const linkedinObj = socialLinks.find((l) => l.platform?.toLowerCase() === "linkedin");
      const instagramObj = socialLinks.find((l) => l.platform?.toLowerCase() === "instagram");
      const websiteObj = socialLinks.find(
        (l) => l.platform?.toLowerCase() === "website" || l.platform?.toLowerCase() === "web"
      );

      const payload = {
        specialty,
        title,
        bio,
        institution: institution || null,
        selectedAreas: selectedAreas || [],
        clinicData: clinicChoice === "yes" ? {
          spaceType: spaceType === "Otro" ? (customSpaceType.trim() || "Otro") : (spaceType || null),
          customSpaceType: spaceType === "Otro" ? customSpaceType.trim() : null,
          spaceCategories: spaceCategories || [],
          spaceServices: spaceServices || [],
          clinicName: clinicName || null,
          clinicDescription: clinicDescription || null,
          clinicAddress: clinicAddress || null,
          clinicCity: city || null,
          clinicCountry: country || null,
          clinicLat: lat || null,
          clinicLng: lng || null,
          googlePlaceId: googlePlaceId || null,
          googleMapsUrl: googleMapsUrl || null,
          clinicPhone: clinicPhone.trim() ? `${phoneCountry.dial} ${clinicPhone.trim()}` : null,
          clinicWebsite: clinicWebsite || null,
          clinicCoverUrl: selectedPhotoUrl || null,
        } : null,
        sessionsData: sessionsChoice === "yes" ? {
          enabled: sessionsEnabled,
          selectedDays: selectedDays || [],
          startTime: startTime || null,
          endTime: endTime || null,
          timeZone: timeZone || null,
        } : null,
        resumeKey: uploadedResume?.key || null,
        resumeFileName: uploadedResume?.fileName || null,
        resumeContentType: uploadedResume?.contentType || null,
        resumeSize: uploadedResume?.contentLength || null,
        linkedinUrl: linkedinObj?.url || null,
        instagramUrl: instagramObj?.url || null,
        websiteUrl: websiteObj?.url || null,
        courses:
          coursesChoice === "yes"
            ? courses.map((c) => ({
                name: c.name,
                type: c.type || null,
                description: c.description,
                modality: c.modality || null,
                url: c.url,
                coverUrl: c.coverUrl || null,
                institution: c.institution || null,
              }))
            : [],
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
        alert(data.message || "Error al enviar la aplicación.");
        return;
      }

      goToStep(6); // Go to thank you screen
    } catch (err) {
      console.error("Failed to submit application:", err);
      alert("Error de conexión al enviar la aplicación.");
    } finally {
      setLoading(false);
    }
  };

  const isUnderReview = appStatus?.status === "pending_review";

  return (
    <div className="flex-grow w-full bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      {/* 1. Left Sidebar */}
      <OnboardingSidebar
        step={isUnderReview ? 6 : step}
        maxVisitedStep={maxVisitedStep}
        onStepClick={(targetStep) => !isUnderReview && goToStep(targetStep)}
        isCheckingStatus={checkingStatus}
        hideStepper={isUnderReview}
      />

      {/* 2. Main Onboarding wizard pane */}
      <div className="flex-grow flex flex-col pt-0">
        <div 
          className={`flex-grow flex flex-col items-center pt-4 pb-6 md:py-6 px-4 md:px-6 ${(step === 6 || isUnderReview) ? "justify-center" : ""}`}
        >
          <div className="w-full max-w-[580px] flex flex-col">
            {checkingStatus ? (
              <div className="flex items-center justify-center py-20">
                <span className="animate-spin material-symbols-rounded text-slate-400 text-[28px]">
                  progress_activity
                </span>
              </div>
            ) : isUnderReview ? (
              <ApplicationStatusView
                createdAt={appStatus?.createdAt}
                email={appStatus?.email}
              />
            ) : (
              <>
                {step === 1 && (
                  <Step1Intro
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                    errorField={errorField}
                    setErrorField={setErrorField}
                    onNext={() => goToStep(2)}
                  />
                )}

                {step === 2 && (
                  <Step2Profile
                    specialty={specialty}
                    setSpecialty={setSpecialty}
                    specialtyOptions={specialtyOptions}
                    selectedAreas={selectedAreas}
                    setSelectedAreas={setSelectedAreas}
                    title={title}
                    setTitle={setTitle}
                    institution={institution}
                    setInstitution={setInstitution}
                    bio={bio}
                    setBio={setBio}
                    socialLinks={socialLinks}
                    setSocialLinks={setSocialLinks}
                    resumeFile={resumeFile}
                    setResumeFile={setResumeFile}
                    errorField={errorField}
                    setErrorField={setErrorField}
                    onNext={() => goToStep(3)}
                    onBack={() => goToStep(1)}
                  />
                )}

                {step === 3 && (
                  <Step3Sessions
                    sessionsChoice={sessionsChoice}
                    setSessionsChoice={setSessionsChoice}
                    setSessionsEnabled={setSessionsEnabled}
                    selectedDays={selectedDays}
                    setSelectedDays={setSelectedDays}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    timeZone={timeZone}
                    setTimeZone={setTimeZone}
                    errorField={errorField}
                    setErrorField={setErrorField}
                    onNext={() => goToStep(4)}
                    onBack={() => goToStep(2)}
                  />
                )}

                {step === 4 && (
                  <Step4Spaces
                    clinicChoice={clinicChoice}
                    setClinicChoice={setClinicChoice}
                    setClinicEnabled={setClinicEnabled}
                    spaceType={spaceType}
                    setSpaceType={setSpaceType}
                    customSpaceType={customSpaceType}
                    setCustomSpaceType={setCustomSpaceType}
                    spaceCategories={spaceCategories}
                    setSpaceCategories={setSpaceCategories}
                    spaceServices={spaceServices}
                    setSpaceServices={setSpaceServices}
                    clinicName={clinicName}
                    setClinicName={setClinicName}
                    clinicDescription={clinicDescription}
                    setClinicDescription={setClinicDescription}
                    clinicAddress={clinicAddress}
                    setClinicAddress={setClinicAddress}
                    city={city}
                    setCity={setCity}
                    country={country}
                    setCountry={setCountry}
                    lat={lat}
                    setLat={setLat}
                    lng={lng}
                    setLng={setLng}
                    googlePlaceId={googlePlaceId}
                    setGooglePlaceId={setGooglePlaceId}
                    googleMapsUrl={googleMapsUrl}
                    setGoogleMapsUrl={setGoogleMapsUrl}
                    clinicPhone={clinicPhone}
                    setClinicPhone={setClinicPhone}
                    clinicWebsite={clinicWebsite}
                    setClinicWebsite={setClinicWebsite}
                    phoneCountry={phoneCountry}
                    setPhoneCountry={setPhoneCountry}
                    selectedPhotoUrl={selectedPhotoUrl}
                    setSelectedPhotoUrl={setSelectedPhotoUrl}
                    suggestedPhotos={suggestedPhotos}
                    setSuggestedPhotos={setSuggestedPhotos}
                    activePhotoIndex={activePhotoIndex}
                    setActivePhotoIndex={setActivePhotoIndex}
                    photoAttribution={photoAttribution}
                    setPhotoAttribution={setPhotoAttribution}
                    errorField={errorField}
                    setErrorField={setErrorField}
                    onNext={() => goToStep(5)}
                    onBack={() => goToStep(3)}
                  />
                )}

                {step === 5 && (
                  <Step5Courses
                    coursesChoice={coursesChoice}
                    setCoursesChoice={setCoursesChoice}
                    setCoursesEnabled={setCoursesEnabled}
                    courses={courses}
                    setCourses={setCourses}
                    loading={loading}
                    errorField={errorField}
                    setErrorField={setErrorField}
                    onSubmit={handleSubmit}
                    onBack={() => goToStep(4)}
                  />
                )}

                {step === 6 && <OnboardingSuccessModal />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
