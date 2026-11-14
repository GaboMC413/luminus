import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

const TARGET_FILES = [
  "components/ui/ProfileSectionCard.tsx",
  "components/ui/UnderlineTabs.tsx",
  "features/user-profile/components/ProfileHeroHeader.tsx",
  "features/user-profile/components/ProfileAboutSection.tsx",
  "features/user-profile/components/ProfileInterestsSection.tsx",
  "features/user-profile/components/ProfileCompletionCard.tsx",
  "features/user-profile/components/ProfilePrompts.tsx",
  "features/user-profile/components/ProfileMembershipCard.tsx",
  "features/user-profile/components/SpecialistProfileView.tsx",
  "features/user-profile/components/IntroSessionScheduler.tsx",
  "features/user-profile/components/ProfileContent.tsx",
  "features/user-profile/modals/ShareProfileModal.tsx",
  "features/user-profile/modals/EditPersonalInfoModal.tsx",
  "features/user-profile/modals/EditAboutModal.tsx",
  "features/user-profile/modals/EditInterestsModal.tsx",
  "features/user-profile/modals/EditPromptsModal.tsx",
  "features/user-profile/modals/CoverSelectorModal.tsx",
  "features/user-profile/modals/EditSpecialistPracticeModal.tsx",
  "features/user-profile/modals/EditSpecialistSpacesModal.tsx",
  "features/user-profile/modals/EditSpecialistCoursesModal.tsx",
  "features/user-profile/modals/EditSpecialistAvailabilityModal.tsx",
  "app/inicio/public-profile/page.tsx",
];

describe("LUMINUS Profile Design System Guard", () => {
  it("contains zero arbitrary font sizes (text-[Npx]) in profile surfaces", () => {
    const violations: string[] = [];
    for (const rel of TARGET_FILES) {
      const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const matches = content.match(/text-\[\d+px\]/g);
      if (matches) {
        violations.push(`${rel}: ${matches.join(", ")}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("contains zero banned color tokens (border-black, ring-black, bg-black, text-red-)", () => {
    const violations: string[] = [];
    for (const rel of TARGET_FILES) {
      const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const matches = content.match(/\b(border-black|ring-black|bg-black|text-red-\d+)\b/g);
      if (matches) {
        violations.push(`${rel}: ${matches.join(", ")}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("contains zero raw <textarea or text <input> outside components/ui/", () => {
    const violations: string[] = [];
    for (const rel of TARGET_FILES) {
      if (rel.startsWith("components/ui/")) continue;
      const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
      if (/<textarea\b/.test(content)) {
        violations.push(`${rel}: raw <textarea>`);
      }
      if (/<input[^>]*type=["']text["']/.test(content)) {
        violations.push(`${rel}: raw <input type="text">`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("contains zero 'Comunidad LUMINUS' filler block in profile surfaces", () => {
    const violations: string[] = [];
    for (const rel of TARGET_FILES) {
      const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
      if (content.includes("Comunidad LUMINUS")) {
        violations.push(rel);
      }
    }
    expect(violations).toEqual([]);
  });
});
