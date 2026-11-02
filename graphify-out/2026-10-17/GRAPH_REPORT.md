# Graph Report - luminus  (2026-10-16)

## Corpus Check
- 330 files · ~2,794,686 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: (none) 5, .ico 4, .css 4)

## Summary
- 1477 nodes · 3600 edges · 73 communities (63 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b20f805`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cognito-password.ts
- InputField
- PageLoader
- ref_next
- "users"
- db.ts
- fetch_videos.js
- users/route.ts
- configuracion/page.tsx
- empresas-aliadas/page.tsx
- platform/package.json
- Footer
- mensajes/page.tsx
- Button
- isUuid
- ref_react
- resumeStorage.ts
- EventCard.tsx
- onboarding.ts
- connections/route.ts
- Section
- getCurrentSession
- marketing/PricingSection.tsx
- README.md
- create-intent/route.ts
- compilerOptions
- compilerOptions
- onboarding/page.tsx
- [slug]/page.tsx
- ContactHero.tsx
- suggestions/route.ts
- package.json
- dependencies
- marketing/app/page.tsx
- marketing/app/especialistas/page.tsx
- PersonalData.tsx
- FaqAccordionList.tsx
- messages/route.ts
- compilerOptions
- entrevistasyencuentros/page.tsx
- Section
- devDependencies
- EventRegistrationSection.tsx
- api/profile/route.ts
- metadata/route.ts
- scripts
- UpcomingEventsTimeline.tsx
- marketing/components/ui/Button.tsx
- FeatureGrid.tsx
- marketing/package.json
- Active Agent Skills
- Luminus Platform Backend
- ContactForm.tsx
- start/route.ts
- runtime/route.ts
- stripe.ts
- platform/next.config.js
- onboarding/profile/route.ts
- InputField
- Reglas del Proyecto LUMINUS (AGENTS.md)
- categories/reset/route.ts
- CODE_OF_CONDUCT.md
- contacts.sql
- amplify/package.json
- comunidad/page.tsx
- EditableField.tsx
- passwordResetEmail.ts

## God Nodes (most connected - your core abstractions)
1. `getCurrentSession()` - 84 edges
2. `Button()` - 72 edges
3. `PageLoader()` - 44 edges
4. `InputField` - 43 edges
5. `isUuid()` - 32 edges
6. `SelectInput` - 30 edges
7. `Footer()` - 29 edges
8. `Navbar()` - 29 edges
9. `Modal()` - 29 edges
10. `PlatformNavbar()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `RecordingsGridProps` --references--> `EventItem`  [EXTRACTED]
  apps/marketing/components/events/RecordingsGrid.tsx → apps/marketing/components/events/EventCard.tsx
- `loadConversations()` --calls--> `isUuid()`  [EXTRACTED]
  apps/platform/app/mensajes/page.tsx → apps/platform/utils/validation.ts
- `POST()` --calls--> `sendEventRegistrationEmail()`  [EXTRACTED]
  apps/marketing/app/api/event-inscription/route.ts → apps/marketing/lib/ses.ts
- `ContactoPage()` --calls--> `ContactHero()`  [EXTRACTED]
  apps/marketing/app/contacto/page.tsx → apps/marketing/components/contact/ContactHero.tsx
- `EmpresasAliadasPage()` --calls--> `FeatureGrid()`  [EXTRACTED]
  apps/marketing/app/empresas-aliadas/page.tsx → apps/marketing/components/marketing/FeatureGrid.tsx

## Import Cycles
- None detected.

## Communities (73 total, 10 thin omitted)

### Community 0 - "cognito-password.ts"
Cohesion: 0.05
Nodes (73): POST(), runtime, PATCH(), runtime, CognitoIdentityClaim, CognitoIdTokenClaims, CognitoStartState, CognitoTokenResponse (+65 more)

### Community 1 - "InputField"
Cohesion: 0.08
Nodes (47): AdminUsersClient(), AdminBadge(), AdminBadgeProps, AdminCard(), AdminCardProps, AdminDetailRow(), AdminDetailRowProps, AdminSectionHeaderProps (+39 more)

### Community 2 - "PageLoader"
Cohesion: 0.07
Nodes (36): CrearCuentaPage(), metadata, Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+28 more)

### Community 3 - "ref_next"
Cohesion: 0.06
Nodes (49): jakarta, metadata, getCognitoDomain(), POST(), runtime, POST(), runtime, runtime (+41 more)

### Community 4 - ""users""
Cohesion: 0.06
Nodes (42): "interest_categories", interest_categories_slug_key, "interests", interests_slug_key, "user_interests", "user_profiles", "users", users_cognito_sub_key (+34 more)

### Community 5 - "db.ts"
Cohesion: 0.12
Nodes (18): DELETE(), runtime, DELETE(), GET(), PATCH(), POST(), PUT(), runtime (+10 more)

### Community 6 - "fetch_videos.js"
Cohesion: 0.08
Nodes (31): POST(), POST(), cleanTimeText(), ContactNotificationPayload, DEFAULT_RECIPIENTS, EventRegistrationEmailPayload, formatEmailDate(), getSesClient() (+23 more)

### Community 7 - "users/route.ts"
Cohesion: 0.09
Nodes (29): AdminPage(), dynamic, runtime, DELETE(), describeAdminUpdateError(), GET(), PATCH(), requireAdmin() (+21 more)

### Community 8 - "configuracion/page.tsx"
Cohesion: 0.15
Nodes (19): SettingsContent(), SettingsPage(), CONFETTI_COLORS, ConfettiExplosion(), ConfettiParticle, SuccessModal(), SuccessModalProps, EditableField() (+11 more)

### Community 9 - "empresas-aliadas/page.tsx"
Cohesion: 0.24
Nodes (10): EmpresasAliadasPage(), metadata, BenefitItem, BenefitsGrid(), BenefitsGridProps, CTASection(), Container(), bgClasses (+2 more)

### Community 10 - "platform/package.json"
Cohesion: 0.08
Nodes (24): autoprefixer, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/s3-request-presigner, lucide-react, next, postcss, react (+16 more)

### Community 11 - "Footer"
Cohesion: 0.21
Nodes (14): ContactoPage(), metadata, CondicionesEspecialistasPage(), metadata, CookiesPage(), metadata, LegalPage(), metadata (+6 more)

### Community 12 - "mensajes/page.tsx"
Cohesion: 0.13
Nodes (19): Conversation, fallbackAvatar(), Message, MessagesContent(), loadConversations(), MessagesPage(), ChatPopup(), ChatPopupProps (+11 more)

### Community 13 - "Button"
Cohesion: 0.05
Nodes (70): SignInPage(), SignUpPage(), PublicProfileContent(), PublicProfilePage(), EspaciosPage(), AppStatusData, EspecialistasPage(), FaroPage() (+62 more)

### Community 14 - "isUuid"
Cohesion: 0.17
Nodes (13): GET(), runtime, POST(), runtime, VALID_REASONS, dynamic, GET(), runtime (+5 more)

### Community 15 - "ref_react"
Cohesion: 0.12
Nodes (7): metadata, FAQCategory, FAQItem, TrustSectionProps, especialistasContent, eventosContent, homeContent

### Community 16 - "resumeStorage.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), runtime, dynamic, POST(), runtime, ALLOWED_CONTENT_TYPES, extensionForContentType() (+15 more)

### Community 17 - "EventCard.tsx"
Cohesion: 0.18
Nodes (16): EventCard(), EventCardProps, EventItem, formatDate(), getYoutubeId(), CATEGORY_COLORS, PastEventsArchive(), PastEventsArchiveProps (+8 more)

### Community 18 - "onboarding.ts"
Cohesion: 0.19
Nodes (10): DELETE(), GET(), PATCH(), runtime, serializeNotification(), CELEBRATION_COPY, getOnboardingQuests(), NewlyCompletedQuest (+2 more)

### Community 19 - "connections/route.ts"
Cohesion: 0.20
Nodes (15): DELETE(), GET(), PATCH(), POST(), PUT(), runtime, serializeConnection(), conversationInclude (+7 more)

### Community 20 - "Section"
Cohesion: 0.19
Nodes (14): metadata, SobreNosotrosPage(), PlatformSection(), PlatformSectionProps, ProblemSection(), ProblemSectionProps, FeatureGrid(), Hero() (+6 more)

### Community 21 - "getCurrentSession"
Cohesion: 0.15
Nodes (17): DELETE(), PATCH(), POST(), runtime, slugify(), DELETE(), PATCH(), POST() (+9 more)

### Community 22 - "marketing/PricingSection.tsx"
Cohesion: 0.60
Nodes (4): PricingCard(), PricingCardProps, PricingSection(), PricingSectionProps

### Community 23 - "README.md"
Cohesion: 0.10
Nodes (18): Code of Conduct, Contributing Guidelines, Contributing via Pull Requests, Finding contributions to work on, Licensing, Reporting Bugs/Feature Requests, Security issue notifications, 1. Database-Connected Mode (Default & Dev Connection) (+10 more)

### Community 24 - "create-intent/route.ts"
Cohesion: 0.67
Nodes (3): POST(), runtime, createMembershipSubscription()

### Community 25 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 26 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 27 - "onboarding/page.tsx"
Cohesion: 0.10
Nodes (24): AppStatusData, SpecialistOnboardingPage(), specialtyOptions, ApplicationStatusView(), ApplicationStatusViewProps, OnboardingSidebar(), OnboardingSidebarProps, BENEFITS (+16 more)

### Community 29 - "[slug]/page.tsx"
Cohesion: 0.15
Nodes (13): GrabacionesListingPage(), metadata, dynamic, DynamicEventRegistrationPage(), generateMetadata(), getEventBySlug(), PageProps, revalidate (+5 more)

### Community 30 - "ContactHero.tsx"
Cohesion: 0.18
Nodes (12): ContactHero(), MOTIVOS, CustomSelect(), CustomSelectProps, SelectOption, parsePhoneNumber(), PhoneInput(), PhoneInputProps (+4 more)

### Community 31 - "suggestions/route.ts"
Cohesion: 0.67
Nodes (3): POST(), runtime, slugify()

### Community 32 - "package.json"
Cohesion: 0.05
Nodes (40): auth, data, Schema, dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, devDependencies, @aws-amplify/backend (+32 more)

### Community 33 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, aws-amplify, @aws-amplify/ui-react, @aws-sdk/client-cognito-identity-provider, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/s3-request-presigner, libphonenumber-js (+9 more)

### Community 34 - "marketing/app/page.tsx"
Cohesion: 0.11
Nodes (15): Home(), CATEGORIES, CategoriesGrid(), ContactBanner(), ConversationSection(), DarkFeatureShowcase(), FeatureCards(), ForSpecialistsSection() (+7 more)

### Community 36 - "marketing/app/especialistas/page.tsx"
Cohesion: 0.16
Nodes (12): metadata, SpecialistsPage(), SpecialistsClosingCta(), SpecialistsControlBanner(), DISCIPLINES, SpecialistsDisciplines(), SpecialistsHero(), SpecialistsOverviewCard() (+4 more)

### Community 37 - "PersonalData.tsx"
Cohesion: 0.14
Nodes (19): metadata, PerfilCompletarPage(), LocationInput, LocationInputProps, getCountryMaxLength(), PhoneInput(), PhoneInputProps, capitalizeName() (+11 more)

### Community 38 - "FaqAccordionList.tsx"
Cohesion: 0.24
Nodes (11): FaqsPage(), metadata, CategorizedFaqs(), FaqAccordionList(), FaqAccordionListProps, FaqSection(), HOME_FAQ_IDS, SpecialistsFaq() (+3 more)

### Community 39 - "messages/route.ts"
Cohesion: 0.26
Nodes (10): dynamic, POST(), runtime, assertParticipant(), dynamic, GET(), POST(), runtime (+2 more)

### Community 40 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, paths, resolveJsonModule, skipLibCheck (+3 more)

### Community 41 - "entrevistasyencuentros/page.tsx"
Cohesion: 0.23
Nodes (10): EntrevistasPage(), metadata, EntrevistasYEncuentrosPage(), metadata, EventsClosingCta(), EventsFaq(), EventsFormatsGrid(), EventsHero() (+2 more)

### Community 43 - "Section"
Cohesion: 0.25
Nodes (11): EventosPage(), ComparisonColumnProps, ComparisonSection(), ComparisonSectionProps, StepItem, StepsSection(), StepsSectionProps, Button (+3 more)

### Community 44 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+3 more)

### Community 45 - "EventRegistrationSection.tsx"
Cohesion: 0.29
Nodes (9): cleanTimeString(), EventItem, EventRegistrationSection(), EventRegistrationSectionProps, formatDateTimeFull(), parseInlineMarkdown(), renderMarkdownContent(), LocationInput (+1 more)

### Community 46 - "api/profile/route.ts"
Cohesion: 0.36
Nodes (9): formatBirthdate(), GET(), parseBirthdate(), PATCH(), pickString(), ProfilePromptInput, runtime, serializeProfile() (+1 more)

### Community 47 - "metadata/route.ts"
Cohesion: 0.43
Nodes (7): decodeHTMLEntities(), dynamic, extractMetaTag(), extractTitleTag(), parseFallbackFromUrl(), POST(), runtime

### Community 48 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, db:deploy, db:generate, db:migrate, db:seed:interests, db:studio, dev (+2 more)

### Community 49 - "UpcomingEventsTimeline.tsx"
Cohesion: 0.23
Nodes (11): dynamic, metadata, ProximasFechasPage(), revalidate, CATEGORY_COLORS, cleanTimeString(), EventItem, getLocalTimeString() (+3 more)

### Community 50 - "marketing/components/ui/Button.tsx"
Cohesion: 0.25
Nodes (6): CTASectionProps, ButtonProps, ButtonSize, ButtonVariant, sizes, variants

### Community 51 - "FeatureGrid.tsx"
Cohesion: 0.43
Nodes (5): FeatureCard(), FeatureCardProps, FeatureGridProps, Card(), CardProps

### Community 52 - "marketing/package.json"
Cohesion: 0.05
Nodes (37): dependencies, @aws-sdk/client-ses, lucide-react, next, react, react-dom, @supabase/supabase-js, devDependencies (+29 more)

### Community 53 - "Active Agent Skills"
Cohesion: 0.29
Nodes (6): Active Agent Skills, Architecture & Knowledge, Design & UI Craft, Engineering Philosophy, LUMINUS AI Development Guidelines & Skills, Vercel Labs Skills

### Community 55 - "Luminus Platform Backend"
Cohesion: 0.29
Nodes (6): Auth and database, Avatar uploads, Cognito login, Luminus Platform Backend, Password recovery emails, Useful commands

### Community 58 - "start/route.ts"
Cohesion: 0.38
Nodes (6): COGNITO_SCOPES, CognitoStartState, GET(), getCognitoDomain(), getPublicOrigin(), runtime

### Community 59 - "runtime/route.ts"
Cohesion: 0.38
Nodes (6): dynamic, GET(), runTest(), runtime, sanitizeError(), prisma

### Community 60 - "stripe.ts"
Cohesion: 0.40
Nodes (4): CreateSubscriptionResult, isStripeConfigured, stripe, stripe

### Community 62 - "platform/next.config.js"
Cohesion: 0.33
Nodes (3): nextConfig, nextConfig, path

### Community 63 - "onboarding/profile/route.ts"
Cohesion: 0.47
Nodes (5): parseBirthdate(), POST(), runtime, slugify(), libphonenumber-js

### Community 64 - "InputField"
Cohesion: 0.18
Nodes (13): AreaBlock, AreaServicesPills(), PlacesSearchAutocomplete(), SPACE_TYPE_OPTIONS, Step4Clinics, Step4Spaces(), Step4SpacesProps, SpaceServiceItem (+5 more)

### Community 66 - "categories/reset/route.ts"
Cohesion: 0.50
Nodes (4): defaultCategories, POST(), runtime, slugify()

### Community 68 - "contacts.sql"
Cohesion: 0.83
Nodes (3): idx_contact_messages_created_at, idx_contact_messages_email, public.contact_messages

### Community 77 - "comunidad/page.tsx"
Cohesion: 0.13
Nodes (13): CATEGORIES_MAPPING, PlatformContent(), PlatformPage(), getCategoriesAsync(), InterestPill(), InterestPillProps, LEGACY_CATEGORY_MAP, CategoryInfo (+5 more)

### Community 78 - "EditableField.tsx"
Cohesion: 0.33
Nodes (6): EditableFieldProps, currentYearNum, DAYS, isValidBirthdate(), MONTHS, YEARS

### Community 79 - "passwordResetEmail.ts"
Cohesion: 0.12
Nodes (29): isValidEmail(), POST(), runtime, POST(), runtime, POST(), runtime, ContactEmailPreviewPage() (+21 more)

## Knowledge Gaps
- **44 isolated node(s):** `@aws-sdk/client-ses`, `lucide-react`, `next`, `react`, `react-dom` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 555 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@supabase/supabase-js` connect `fetch_videos.js` to `marketing/app/page.tsx`, `marketing/package.json`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `@aws-sdk/client-ses`, `lucide-react`, `next` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cognito-password.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054212454212454214 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `users/route.ts` to `cognito-password.ts`, `platform/package.json`, `db.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `InputField` be split into smaller, more focused modules?**
  _Cohesion score 0.07724764686790003 - nodes in this community are weakly interconnected._
- **Why does `libphonenumber-js` connect `onboarding/profile/route.ts` to `platform/package.json`, `PersonalData.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.06578947368421052 - nodes in this community are weakly interconnected._