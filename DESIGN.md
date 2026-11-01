# LUMINUS Platform — Design System & UI Specifications (`DESIGN.md`)

> **The Single Source of Truth for Visual Craft, Tokens, and Component Contracts**  
> *Derived from the canonical reference implementations: New Signup/Onboarding (`apps/platform/features/membership/`) and User Profile Settings (`apps/platform/app/perfil-usuario/configuracion/`).*

---

## 1. System Vision & Core Architectural Laws

The goal of this design system is to enforce visual coherence, premium aesthetic polish, and rapid engineering without visual drift. Every interface within LUMINUS must follow these non-negotiable architectural laws:

1. **The Closed Token Rule (Zero Arbitrary Values)**: Never write arbitrary Tailwind pixel utilities (e.g. `text-[13px]`, `rounded-[22px]`, `py-2.5`, `border-zinc-200`). Every font size, color, radius, and spacing must map directly to the established semantic tokens.
2. **The Primitive Gatekeeper Rule**: Never implement raw HTML `<button>` or `<input>` tags directly within screens. Always consume the hardened UI primitives (`<Button>`, `<InputField>`, `<Card>`, etc.).
3. **Single Icon Standard**: All icons must strictly originate from **`lucide-react`**. Google Material Symbols / Material Icons are deprecated and forbidden.

---

## 2. Foundational Tokens

### 2.1 The Two-Font System (Font Pairing Law)

Typography is divided strictly by cognitive role:

* **Structure & Action Font**: **Plus Jakarta Sans** (`font-jakarta`)
  * Reserved for: Titles, Headings, Action Buttons, Navigation Links, Form Labels, Metrics, and Badges.
* **Content & Prose Font**: **Inter** (`font-sans`)
  * Reserved for: Body text, Post content, Descriptions, Subtitles, Help text, and Metadata timestamps.

### 2.2 The 6-Tier Typography Scale

| Semantic Token | Font Family | Size / Line-Height | Weight | Tracking | Usage & Where it Applies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`text-display`** | Jakarta | `26px` / `32px` | `font-bold` (700) | `tracking-tight` | Full-page standalone hero titles (`CompleteProfileView`, `AccountCreationView`, Welcome screens). |
| **`text-title-page`** | Jakarta | `22px` / `28px` | `font-bold` (700) | `tracking-tight` | Main page title inside app shell (`SettingsLayout`, Directories, Admin). |
| **`text-title-section`**| Jakarta | `13px`–`14px` / `20px` | `font-semibold` (600) | `normal` | Card headers, block titles. Softer and smaller than usernames to eliminate visual competition. |
| **`text-body`** | Inter | `14px` / `22px` | `font-normal` (400)| `normal` | General readable copy, descriptions, post text, terms. |
| **`text-label`** | Jakarta | `12px` / `16px` | `font-semibold` (600)| `normal` | Input field labels (`EditableField`), button action labels, tab items. |
| **`text-meta`** | Inter | `11px` / `15px` | `font-medium` (500)| `normal` | Auxiliary context, timestamps ("Hace 2h"), input hints, checklist criteria. |

---

### 2.3 Color Palette & Semantic Roles

Colors represent state and purpose, not decorative variety.

```
┌────────────────────────────────────────────────────────┐
│ 1. BRAND & PRIMARY ACTION (Dominant Neutral Slate)     │
│    • slate-900 (#0F172A) → Primary CTA, Active Text    │
│    • black     (#000000) → Primary CTA Hover State     │
├────────────────────────────────────────────────────────┤
│ 2. SURFACES & CANVASES                                 │
│    • slate-50  (#F8FAFC) → Page Canvas Backdrop        │
│    • white     (#FFFFFF) → Card Containers & Inputs    │
│    • slate-100 (#F1F5F9) → Subtle Chips & Soft Buttons │
├────────────────────────────────────────────────────────┤
│ 3. BORDERS & SEPARATORS                                │
│    • slate-200/90        → Card & Container Outlines   │
│    • slate-200           → Input Field Default Borders │
│    • slate-100           → Inner Subtle Dividers       │
├────────────────────────────────────────────────────────┤
│ 4. FEEDBACK & ACCENTS                                  │
│    • rose-600  (#E11D48) → Destructive actions, Errors │
│    • rose-50   (#FFF1F2) → Error Background Banners    │
│    • emerald-600 (#059669) → Verified badges, Success  │
│    • emerald-50 (#ECFDF5) → Success Background         │
└────────────────────────────────────────────────────────┘
```

---

### 2.4 Spatial Radii & Elevation

* **`rounded-2xl` (16px)**: Reserved for outer surface containers: `<Card>`, `<Modal>`, `<SectionHeader>` wrappers, and dropdown menus.
* **`rounded-xl` (12px)**: Reserved for all interactive controls: Buttons, Input fields, Select triggers, and User avatars (sizes sm–lg).
* **`rounded-full`**: Reserved for status badges ("Predeterminada", "Mecenas"), notification count pills, and circular icon buttons.

---

## 3. Component Contracts & Standards

### 3.1 The Button Primitive (`@/components/ui/Button`)

Every interactive trigger must consume `<Button>` with the appropriate variant and size.

```tsx
// Correct Usage Examples:
<Button variant="primary">Guardar cambios</Button>
<Button variant="secondary">Continuar con Google</Button>
<Button variant="soft" size="sm">Cambiar foto</Button>
<Button variant="ghost">Ver mi perfil</Button>
<Button variant="destructive">Cerrar cuenta</Button>
```

#### Variant Specifications:
1. **`primary`** (Main Outcome):
   * Visual: `bg-slate-900 text-white hover:bg-black rounded-xl font-jakarta text-sm font-semibold transition-all active:scale-[0.99]`
   * When: The single most decisive action on a screen (Submit form, Pay membership, Save changes).
2. **`secondary`** (Alternative Action):
   * Visual: `bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-jakarta text-sm font-semibold transition-all active:scale-[0.99]`
   * When: Complementary actions or exit pathways (Social authentication, Cancel, Back).
3. **`soft`** (Contextual In-Card Action — Borderless & Whisper Background):
   * Visual: `bg-slate-50 hover:bg-slate-100/90 text-slate-600 hover:text-slate-900 border-none rounded-xl font-jakarta text-xs font-medium shadow-none transition-all`
   * When: In-card utility actions ("Ir a mi perfil", "Ver mi red", "Ver todos los miembros", "Cambiar foto").
   * **Rule**: Must remain strictly **borderless** with `font-medium` (500) and whisper background (`bg-slate-50`). A dark gray box or bold text inside an already bordered card creates harsh visual cage clutter and draws undue visual gravity away from the primary content.
4. **`ghost`** (Chrome-less Action):
   * Visual: `bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-none rounded-xl font-jakarta text-xs font-semibold shadow-none`
   * When: Nav items, dropdown actions, table row menus (`...`), and icon toggles.
5. **`destructive`** (Danger Action):
   * Visual: `bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-jakarta text-sm font-semibold shadow-none border-none`
   * When: Irreversible actions (Delete payment method, Cancel subscription, Close account).

#### Standard Sizing:
* **`lg` (`h-11 px-5`)**: Default for full-page forms, auth, and primary actions (`text-sm font-semibold`).
* **`md` (`h-10 px-4`)**: Standard for navbar controls, search triggers, and modal actions (`text-xs sm:text-sm font-semibold`).
* **`sm` (`h-8.5 px-3`)**: Compact size for in-card chips, photo upload, and sidebar list actions (`text-xs font-medium`). Never scales up on larger breakpoints.

---

### 3.2 Form Controls & Data-Entry Contract

All data entry fields across **Sign-in**, **Sign-up**, **Specialist Onboarding**, and **Account Settings** share a strictly unified anatomical contract. 

```
┌────────────────────────────────────────────────────────┐
│ LABEL CONTAINER                                        │
│ font-jakarta text-xs font-semibold text-slate-700      │
│ [ Nombre de pila ]                             * req   │
├────────────────────────────────────────────────────────┤
│ INPUT BOX (Locked to 44px / h-11)                      │
│ • Height:      h-11 (44px)                             │
│ • Border:      border border-slate-200                 │
│ • Radius:      rounded-xl                              │
│ • Background:  bg-white (or bg-slate-50 when disabled) │
│ • Text:        font-sans text-xs sm:text-sm            │
│ • Color:       text-slate-900                          │
│ • Placeholder: placeholder:text-slate-400              │
│ • Focus State: focus:border-slate-900 focus:ring-1     │
│                focus:ring-slate-900 outline-none       │
│ • Error State: border-rose-500 focus:border-rose-500   │
│                focus:ring-rose-500                     │
├────────────────────────────────────────────────────────┤
│ VALIDATION & HELPER TEXT                               │
│ • Error:  font-sans text-xs font-medium text-rose-600  │
│ • Helper: font-sans text-[11px] text-slate-400 font-med│
└────────────────────────────────────────────────────────┘
```

#### 3.2.1 Standard Single-Line Input (`<InputField />`)
* **Component Path**: `@/components/ui/InputField.tsx`
* **Use for**: Email, Password, First/Last Name, Profession, Postal Code, Numbers, URLs.
* **Built-in Capabilities**:
  * **Password Toggle**: When `type="password"`, automatically renders the eye toggle icon (`Eye` / `EyeOff` from `lucide-react`) at `right-3.5`.
  * **Icon Support**: Accepts `rightIcon` slot with standard `w-4 h-4 text-slate-400`.
  * **Error Handling**: Pass `error="Mensaje de error"`. Automatically paints `border-rose-500` and renders the error message below.
* **Usage**:
  ```tsx
  <InputField
    label="Correo electrónico"
    type="email"
    required
    placeholder="nombre@ejemplo.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={errors.email}
  />
  ```

#### 3.2.2 Dropdowns & Selects (`<SelectInput />`)
* **Component Path**: `@/components/ui/SelectInput.tsx`
* **Use for**: Gender selection, Specialist Category, Session duration, Timezones, Modality.
* **Geometry**: Must match `InputField` exactly: `h-11`, `px-3.5`, `rounded-xl`, `border-slate-200`, `font-sans text-sm`.
* **Usage**:
  ```tsx
  <SelectInput
    label="Género"
    value={gender}
    options={["Mujer", "Hombre", "No binario", "Prefiero no decirlo"]}
    onSelect={(val) => setGender(val)}
    error={Boolean(errors.gender)}
  />
  ```

#### 3.2.3 Compound / Specialized Inputs
1. **Location Input (`<LocationInput />`)**:
   * Google Places autocomplete wrapper.
   * Container must strictly be `h-11 rounded-xl border border-slate-200 bg-white`.
   * Error state applies `border-rose-500 focus:border-rose-500`.
2. **Phone Input (`<PhoneInput />`)**:
   * Combines a country flag/code selector with a phone number text field.
   * Both sub-elements sit inside the `h-11 rounded-xl border border-slate-200` container.
3. **Date of Birth (`<BirthdateInput />` / 3-Dropdown Pattern)**:
   * Displays Day (`1-31`), Month (`Enero-Diciembre`), and Year (`1900-Current`).
   * Renders as a 3-column grid (`grid grid-cols-3 gap-2 sm:gap-3`).
   * Each dropdown is an instance of `<SelectInput>` sharing the same `h-11 rounded-xl` geometry.
   * Label is placed above: `font-jakarta text-xs font-semibold text-slate-700` with optional helper `Mayor de 18 años` on the right (`text-meta`).

#### 3.2.4 Specialist Onboarding Field Standards (`SpecialistSignUpWizard.tsx`)
* **STRICT BAN ON `#FF3D3D`**: All error borders must use `border-rose-500` and error text must use `text-rose-600 font-sans text-xs font-medium`. Never use raw hex `#FF3D3D`.
* **Wizard Stepper**: Multi-step forms must use `<InputField>` and `<SelectInput>` without wrapping them in custom inline borders or arbitrary margin tags.
* **Required Indicators**: Required labels display a subtle `text-rose-500` asterisk: `<span className="text-rose-500 ml-0.5">*</span>`.

---

#### 3.2.5 How to Prompt Any Agent to Apply this Standard
When instructing any AI coding agent to refactor or build a form, use this exact prompt:
> *"Refactor the form fields on this page to comply strictly with DESIGN.md Section 3.2. Replace all raw inputs or custom-styled wrappers with <InputField>, <SelectInput>, or standard compound inputs. Ensure all inputs are h-11, rounded-xl, border-slate-200, with labels in font-jakarta text-xs font-semibold text-slate-700, and all errors rendered via the built-in rose-500/600 error tokens without arbitrary hex codes like #FF3D3D."*

---

### 3.3 Surface & Card Container Standard

All cards across the feed, profile settings, and directories use the exact same surface geometry:

```html
<div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-none">
  <!-- Card Header -->
  <h2 className="text-title-section text-slate-900">...</h2>
  <!-- Content -->
</div>
```

---

### 3.4 User Identity & Profile Display Standard

To eliminate fragmentation between the Navbar, Feed, Member Directory, and Settings:

* **Avatar Sizes**:
  * `sm` (32px): Navbar header, compact chat rows.
  * `md` (40px): Feed comments, member lists.
  * `lg` (64px): Directory specialist cards.
  * `xl` (96px): Profile completion hero, Settings personal photo.
* **User Information Hierarchy**:
  1. **Name**: `font-jakarta text-[15px] sm:text-base font-bold text-slate-900`
  2. **Role / Profession**: `font-sans text-xs text-slate-500 font-normal`
  3. **Location / Timestamp**: `font-sans text-[11px] text-slate-400 font-medium`
  4. **Tier Badge ("Mecenas")**: `font-jakarta text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80`

---

## 4. Canonical Molecular Components (Atomic Assembly)

Molecules are standardized combinations of atoms designed **only for patterns that repeat across 3 or more screens**. Never create one-off molecules for single-use features.

### 4.1 List Item Row (`<ListItemRow />`)
* **Path**: `@/components/ui/ListItemRow.tsx`
* **Repeated In**: `RecentMembersCard` (Inicio), `red/page.tsx` (My Network), `mensajes/page.tsx` (Chat threads), `notificaciones/page.tsx` (Notification items), and `inicio/miembros` (Directory).
* **Anatomy & Tokens**:
  ```tsx
  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3 min-w-0">
      <UserAvatar size="md" src={avatar} alt={name} />
      <div className="flex flex-col min-w-0">
        <span className="text-title-section text-[14px] sm:text-[15px] text-slate-900 group-hover:text-slate-700 truncate">
          {name}
        </span>
        <span className="text-meta text-slate-400 truncate font-sans">
          {subtitle || location}
        </span>
      </div>
    </div>
    {/* Trailing Control: Chevron or Action */}
    {trailingAction || <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />}
  </div>
  ```

### 4.2 Card Header (`<CardHeader />`)
* **Path**: `@/components/ui/CardHeader.tsx`
* **Repeated In**: All in-card headers across `inicio` sidebars, `perfil-usuario/configuracion` blocks, and directory sidebars.
* **Anatomy & Tokens**:
  ```tsx
  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
    <div className="flex flex-col">
      <h3 className="text-title-section text-slate-900 m-0">{title}</h3>
      {description && <p className="text-meta text-slate-500 mt-0.5 m-0">{description}</p>}
    </div>
    {action && (
      <Button variant="ghost" size="sm" onClick={action.onClick} className="text-slate-500 hover:text-slate-900">
        {action.label}
      </Button>
    )}
  </div>
  ```

### 4.3 Search Bar (`<SearchBar />`)
* **Path**: `@/components/ui/SearchBar.tsx`
* **Repeated In**: `especialistas`, `espacios`, `grupos`, `inicio/miembros`, and `mensajes`.
* **Anatomy & Tokens**:
  * Input height is locked to `h-11 (44px)`.
  * Left icon: Lucide `<Search className="w-4 h-4 text-slate-400 ml-3.5" />`.
  * Input field: `bg-white border border-slate-200 rounded-xl pl-10 pr-9 text-sm font-sans focus:border-slate-900 focus:ring-1 focus:ring-slate-900`.
  * Right clear button: Appears only when input has value, uses Lucide `<X className="w-3.5 h-3.5 text-slate-400" />`.

### 4.4 Empty State (`<EmptyState />`)
* **Path**: `@/components/ui/EmptyState.tsx`
* **Repeated In**: Any list or feed when data is empty (`mensajes`, `notificaciones`, `red`, `inicio`).
* **Anatomy & Tokens**:
  ```tsx
  <div className="flex flex-col items-center justify-center text-center py-10 px-4">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
      {icon || <Inbox className="w-6 h-6 stroke-[1.75]" />}
    </div>
    <h4 className="text-title-section text-[15px] text-slate-900 mb-1">{title}</h4>
    <p className="text-body text-slate-500 max-w-sm mb-4">{description}</p>
    {actionButton}
  </div>
  ```

---

## 5. Platform Surface Mapping

| Surface | Layout Standard | Primary Action Pattern | Header Component |
| :--- | :--- | :--- | :--- |
| **Top Navbar** | Fixed `h-[64px] bg-white border-b border-slate-200/90` | `<Button variant="ghost">` & Icon buttons | Brand Logo + `NAV_ITEMS` (Jakarta 12px) |
| **Mobile Bottom Nav** | Fixed `h-[60px] bg-white border-t border-slate-200/90` | Lucide icon + `text-[10px] font-jakarta` | Selected tab has active `text-slate-900 font-bold` |
| **Onboarding Flow** | Centered `max-w-[380px]` on `bg-white` | `<Button variant="primary" fullWidth>` | `text-display` + Iso-Logo anchor |
| **Account Settings** | `max-w-6xl` on `bg-slate-50` canvas | `<Button variant="soft" size="sm">` in cards | `<SectionHeader title="..." description="..." />` |
| **Community Feed** | 3-Column responsive grid on `bg-slate-50` | `<Button variant="soft" size="sm" fullWidth>` | `<Card>` wrappers + Lucide `<User />` fallbacks |
| **Modals & Dialogs** | Fixed overlay `bg-black/40 backdrop-blur-sm` | Dual Footer: `variant="secondary"` + `primary"` | `text-title-section` + Close `X` ghost button |

---

## 5. Absolute Anti-Patterns & Prohibitions

1. **NO inline arbitrary font sizes**: Never use `text-[10px]`, `text-[13px]`, `text-[17px]`, or `text-[26px]` outside the 6 approved tokens.
2. **NO raw `<button>` elements**: Any clickable control must use the unified `<Button>` component or be explicitly styled using the button variant classes.
3. **NO Google Material Symbols**: Never write `<span className="material-symbols-outlined">`. Always import the semantic SVG from `lucide-react`.
4. **NO Palette Drift**: Do not introduce `zinc-*`, `gray-*`, `indigo-*`, or raw hex codes into component files. All neutrals are `slate-*`.
5. **NO duplicated button styles**: Do not create separate "pill buttons", "square buttons", or "custom profile buttons". Use `<Button variant="..." size="...">`.
