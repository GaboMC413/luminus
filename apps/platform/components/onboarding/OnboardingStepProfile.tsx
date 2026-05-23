"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MapPin, Briefcase, FileText, Sparkles, Smile } from "lucide-react";

interface StepProfileProps {
  initialData: {
    avatar?: string;
    role?: string;
    bio?: string;
    city?: string;
    country?: string;
    name?: string;
  };
  onNext: (data: any) => void;
}

const PRESET_AVATARS = [
  { id: "leaf", name: "Sage Leaf", color: "bg-emerald-50 border-emerald-200 text-emerald-600", emoji: "🌿" },
  { id: "sun", name: "Warm Sun", color: "bg-amber-50 border-amber-200 text-amber-600", emoji: "☀️" },
  { id: "ocean", name: "Tranquil Flow", color: "bg-sky-50 border-sky-200 text-sky-600", emoji: "🌊" },
  { id: "lotus", name: "Bloom Lotus", color: "bg-rose-50 border-rose-200 text-rose-600", emoji: "🪷" }
];

export const OnboardingStepProfile: React.FC<StepProfileProps> = ({
  initialData,
  onNext
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [role, setRole] = useState(initialData.role || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [city, setCity] = useState(initialData.city || "");
  const [country, setCountry] = useState(initialData.country || "");
  const [selectedAvatar, setSelectedAvatar] = useState(initialData.avatar || "leaf");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please specify your name.");
      return;
    }
    if (!role.trim()) {
      setError("Please specify your professional role or background.");
      return;
    }
    if (!city.trim() || !country.trim()) {
      setError("Please specify your location.");
      return;
    }

    onNext({
      name,
      avatar: selectedAvatar,
      role,
      bio,
      city,
      country
    });
  };

  const activeAvatarDetails = PRESET_AVATARS.find(a => a.id === selectedAvatar) || PRESET_AVATARS[0];

  return (
    <Card className="p-6 sm:p-10 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Avatar Picker Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-wellness-sage-700/80">
            Choose Your Profile Avatar
          </label>
          <div className="flex items-center gap-4">
            {/* Active avatar preview */}
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl shadow-sm transition-premium ${activeAvatarDetails.color}`}>
              {activeAvatarDetails.emoji}
            </div>

            {/* Selection Grid */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-xl transition-premium active:scale-90 ${
                      selectedAvatar === av.id
                        ? `${av.color} ring-2 ring-wellness-sage-500 scale-105 border-wellness-sage-500`
                        : "bg-white hover:bg-wellness-sand-50 border-wellness-sand-200"
                    }`}
                    title={av.name}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-wellness-sage-600 font-semibold tracking-wider uppercase">
                Currently Selected: {activeAvatarDetails.name}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-wellness-clay-50 border border-wellness-clay-200 text-wellness-clay-600 text-xs font-semibold rounded-2xl animate-scale-in">
            {error}
          </div>
        )}

        <Input
          type="text"
          label="Your Public Name"
          placeholder="Camila Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<Smile className="w-4 h-4" />}
          required
        />

        <Input
          type="text"
          label="Professional Role / Focus"
          placeholder="e.g. Mindfulness Guide, Clinical Psychologist, Integrative Nutritionist"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          icon={<Briefcase className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            label="City"
            placeholder="e.g. Bogotá"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            icon={<MapPin className="w-4 h-4" />}
            required
          />
          <Input
            type="text"
            label="Country"
            placeholder="e.g. Colombia"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 pl-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-wellness-sage-700/80">
            A Short Bio (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-wellness-sage-400">
              <FileText className="w-4 h-4" />
            </span>
            <textarea
              className="w-full bg-white/60 hover:bg-white text-sm pl-11 pr-4 py-3.5 border border-wellness-sand-200/90 rounded-2xl outline-none focus:bg-white focus:border-wellness-sage-400 focus:ring-4 focus:ring-wellness-sage-50 min-h-[100px] transition-premium resize-none"
              placeholder="Tell others a bit about your professional path, values, or approach..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-2 flex items-center justify-center gap-2">
          <span>Continue Setup</span>
          <Sparkles className="w-4 h-4" />
        </Button>
        
      </form>
    </Card>
  );
};
export default OnboardingStepProfile;
