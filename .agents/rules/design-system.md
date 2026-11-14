# LUMINUS Design System Guardrails

Every UI change in `apps/platform/` MUST comply with [DESIGN.md](../../DESIGN.md).

## Non-Negotiable Rules

1. **Closed Token Rule**: Use only the semantic typography tokens (`text-display`, `text-title-page`, `text-title-section`, `text-body`, `text-label`, `text-meta`) and `slate-*` palette. Never introduce arbitrary font-size classes (`text-[13px]`, `text-[11px]`, etc.), `zinc-*`, `gray-*`, `border-black`, `ring-black`, or `text-red-*` (use `text-rose-600`).
2. **Canonical UI Primitives**:
   - Modals: `<Modal>` (`@/components/ui/Modal`)
   - Forms: `<InputField>`, `<TextAreaField>`, `<SelectInput>` — never raw `<input>` or `<textarea>` in feature components or modals.
   - Profile cards: `<ProfileSectionCard>` (`@/components/ui/ProfileSectionCard`)
   - Tab bars: `<UnderlineTabs>` (`@/components/ui/UnderlineTabs`) — never button-styled tabs.
3. **Public Empty-State Law**: On public profile views (`isPublic={true}`), empty sections MUST return `null` (handled automatically by `<ProfileSectionCard>`). Never render empty placeholder cards or filler blocks.
4. **Verification**: After any UI edit in `features/user-profile` or `app/inicio/public-profile`, run:
   - `npm --prefix apps/platform run lint:design`
   - `.agents\skills\impeccable\scripts\impeccable.cmd detect --json apps/platform/features/user-profile apps/platform/app/inicio/public-profile`
