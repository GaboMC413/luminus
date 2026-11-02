# Graph Report - luminus  (2026-10-28)

## Corpus Check
- 427 files · ~3,542,173 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: (none) 5, .css 4, .ico 3)

## Summary
- 1939 nodes · 4784 edges · 102 communities (82 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b017d993`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.ts
- AdminUsersClient.tsx
- PageLoader
- ref_next
- "users"
- platform/lib/db.ts
- fetch_videos.js
- users/route.ts
- ref_react
- empresas-aliadas/page.tsx
- platform/package.json
- Footer
- mensajes/page.tsx
- EditableField.tsx
- isUuid
- empresas-aliadas/page.tsx
- resumeStorage.ts
- events.ts
- renderEmailLayout
- serializePost
- unsubscribe/route.ts
- PostCard.tsx
- marketing/PricingSection.tsx
- README.md
- me/route.ts
- compilerOptions
- compilerOptions
- SpecialistSignUpWizard.tsx
- public-profile/page.tsx
- ref_fs
- ContactHero.tsx
- ses.ts
- package.json
- dependencies
- marketing/app/page.tsx
- constants.ts
- marketing/app/especialistas/page.tsx
- Step4Spaces.tsx
- FaqAccordionList.tsx
- marketing/components/ui/Button.tsx
- compilerOptions
- entrevistasyencuentros/page.tsx
- PersonalData.tsx
- Section
- devDependencies
- EventRegistrationSection.tsx
- prisma
- metadata/route.ts
- scripts
- UpcomingEventsTimeline.tsx
- sender.ts
- FeatureGrid.tsx
- marketing/package.json
- Active Agent Skills
- marketing/app/layout.tsx
- Luminus Platform Backend
- red/page.tsx
- mockPostsData.ts
- Button
- migrate-legacy-courses.cjs
- stripe.ts
- notificaciones/page.tsx
- notify-live/route.ts
- local-unsubscribe-helper.ts
- EditPostModal.tsx
- Reglas del Proyecto LUMINUS (AGENTS.md)
- @prisma/client
- CODE_OF_CONDUCT.md
- contacts.sql
- amplify/package.json
- SelectInput
- comunidad/page.tsx
- email/request/route.ts
- platform/app/layout.tsx
- seed-test-upcoming-events.cjs
- cognito-password.ts
- seed-events.cjs
- MembershipPaymentView.tsx
- InputField
- audit-emails.cjs
- check-admin-user.cjs
- fix-and-normalize-categories.cjs
- fix-event-dates.cjs
- make-gabriel-admin.cjs
- GEMINI.md
- posts/[id]/route.ts
- onboarding/profile/route.ts
- IntroSessionScheduler.tsx
- sweep-orphan-s3-files.cjs
- [slug]/page.tsx
- platform/app/especialistas/page.tsx
- ref_lucide_react
- audit-categories.cjs
- clean-false-events.cjs
- make-specialist.cjs

## God Nodes (most connected - your core abstractions)
1. `getCurrentSession()` - 115 edges
2. `Button()` - 94 edges
3. `InputField` - 51 edges
4. `PageLoader()` - 49 edges
5. `Modal()` - 39 edges
6. `SelectInput` - 36 edges
7. `isUuid()` - 32 edges
8. `Footer()` - 29 edges
9. `Navbar()` - 29 edges
10. `PlatformNavbar()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getCurrentSession()`  [EXTRACTED]
  apps/platform/app/api/uploads/post-image/route.ts → apps/platform/lib/auth/session.ts
- `loadConversations()` --calls--> `isUuid()`  [EXTRACTED]
  apps/platform/app/mensajes/page.tsx → apps/platform/utils/validation.ts
- `CreatePostCardProps` --references--> `PostItem`  [EXTRACTED]
  apps/platform/components/community/CreatePostCard.tsx → apps/platform/components/community/mockPostsData.ts
- `EditPostModalProps` --references--> `PostItem`  [EXTRACTED]
  apps/platform/components/community/EditPostModal.tsx → apps/platform/components/community/mockPostsData.ts
- `ContactoClient()` --calls--> `TurnstileWidget()`  [EXTRACTED]
  apps/marketing/app/contacto/ContactoClient.tsx → apps/marketing/components/TurnstileWidget.tsx

## Import Cycles
- None detected.

## Communities (102 total, 20 thin omitted)

### Community 0 - "session.ts"
Cohesion: 0.14
Nodes (27): POST(), runtime, POST(), runtime, POST(), runtime, POST(), runtime (+19 more)

### Community 1 - "AdminUsersClient.tsx"
Cohesion: 0.06
Nodes (59): AdminUsersClient(), AdminBadge(), AdminBadgeProps, AdminCard(), AdminCardProps, AdminDetailRow(), AdminDetailRowProps, AdminSectionHeaderProps (+51 more)

### Community 2 - "PageLoader"
Cohesion: 0.13
Nodes (15): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+7 more)

### Community 3 - "ref_next"
Cohesion: 0.06
Nodes (39): dynamic, GET(), runTest(), runtime, sanitizeError(), runtime, CommunityLayout(), EspaciosLayout() (+31 more)

### Community 4 - ""users""
Cohesion: 0.06
Nodes (42): "interest_categories", interest_categories_slug_key, "interests", interests_slug_key, "user_interests", "user_profiles", "users", users_cognito_sub_key (+34 more)

### Community 5 - "platform/lib/db.ts"
Cohesion: 0.06
Nodes (55): PATCH(), runtime, DELETE(), PATCH(), POST(), runtime, slugify(), defaultCategories (+47 more)

### Community 6 - "fetch_videos.js"
Cohesion: 0.09
Nodes (26): autoCategorize(), decodeHtmlEntities(), delay(), extractVideosFromData(), fetchUrl(), fs, guessSpeaker(), https (+18 more)

### Community 7 - "users/route.ts"
Cohesion: 0.13
Nodes (29): AdminPage(), dynamic, loadAdminSection(), runtime, DELETE(), describeAdminUpdateError(), GET(), PATCH() (+21 more)

### Community 8 - "ref_react"
Cohesion: 0.15
Nodes (19): SettingsContent(), SettingsPage(), CONFETTI_COLORS, ConfettiExplosion(), ConfettiParticle, SuccessModal(), SuccessModalProps, EditableField() (+11 more)

### Community 9 - "empresas-aliadas/page.tsx"
Cohesion: 0.19
Nodes (13): metadata, SobreNosotrosPage(), PlatformSection(), PlatformSectionProps, ProblemSection(), ProblemSectionProps, Hero(), HeroProps (+5 more)

### Community 10 - "platform/package.json"
Cohesion: 0.07
Nodes (28): autoprefixer, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner, lucide-react, @marsidev/react-turnstile, next (+20 more)

### Community 11 - "Footer"
Cohesion: 0.17
Nodes (16): ContactoPage(), metadata, DesuscribirPage(), UnsubscribeContent(), CondicionesEspecialistasPage(), metadata, CookiesPage(), metadata (+8 more)

### Community 12 - "mensajes/page.tsx"
Cohesion: 0.22
Nodes (13): Conversation, fallbackAvatar(), Message, MessagesContent(), loadConversations(), MessagesPage(), ChatPopup(), ChatPopupProps (+5 more)

### Community 13 - "EditableField.tsx"
Cohesion: 0.17
Nodes (11): LocationInputProps, EditableFieldProps, LATAM_COUNTRIES, LATAM_COUNTRY_CODES, sortLatamFirst(), currentYearNum, DAYS, isValidBirthdate() (+3 more)

### Community 14 - "isUuid"
Cohesion: 0.08
Nodes (39): dynamic, POST(), runtime, GET(), MOCK_PROFILES, runtime, POST(), runtime (+31 more)

### Community 15 - "empresas-aliadas/page.tsx"
Cohesion: 0.24
Nodes (12): EmpresasAliadasPage(), metadata, BenefitItem, BenefitsGrid(), BenefitsGridProps, FeatureGrid(), PricingSection(), Container() (+4 more)

### Community 16 - "resumeStorage.ts"
Cohesion: 0.10
Nodes (28): dynamic, GET(), runtime, ALLOWED_CONTENT_TYPES, extensionForContentType(), POST(), runtime, dynamic (+20 more)

### Community 17 - "events.ts"
Cohesion: 0.11
Nodes (30): EventCard(), EventCardProps, EventItem, formatDate(), formatUpcomingDateHeader(), getYoutubeId(), isSpeakerNameValid(), MONTH_NAMES_ES (+22 more)

### Community 18 - "renderEmailLayout"
Cohesion: 0.12
Nodes (22): ContactEmailPreviewPage(), EmailChangePreviewPage(), EmailPreviewPage(), PasswordResetEmailPreviewPage(), WelcomeEmailPreviewPage(), ContactNotificationEmailOptions, renderContactNotificationEmailHtml(), renderEmailChangeVerificationHtml() (+14 more)

### Community 19 - "serializePost"
Cohesion: 0.13
Nodes (17): dynamic, GET(), PATCH(), runtime, POST(), runtime, PATCH(), runtime (+9 more)

### Community 20 - "unsubscribe/route.ts"
Cohesion: 0.09
Nodes (24): dynamic, runtime, dynamic, runtime, dynamic, runtime, TRANSPARENT_GIF, dynamic (+16 more)

### Community 21 - "PostCard.tsx"
Cohesion: 0.18
Nodes (15): PostsTab(), PostsTabProps, CommunityReportModal(), CommunityReportModalProps, REPORT_REASONS, PostItem, formatCityCountry(), PostCard() (+7 more)

### Community 22 - "marketing/PricingSection.tsx"
Cohesion: 0.70
Nodes (3): PricingCard(), PricingCardProps, PricingSectionProps

### Community 23 - "README.md"
Cohesion: 0.10
Nodes (18): Code of Conduct, Contributing Guidelines, Contributing via Pull Requests, Finding contributions to work on, Licensing, Reporting Bugs/Feature Requests, Security issue notifications, 1. Database-Connected Mode (Default & Dev Connection) (+10 more)

### Community 24 - "me/route.ts"
Cohesion: 0.24
Nodes (9): DELETE(), runtime, GET(), getCognitoDomain(), POST(), runtime, GET(), runtime (+1 more)

### Community 25 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 26 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 27 - "SpecialistSignUpWizard.tsx"
Cohesion: 0.09
Nodes (35): metadata, SpecialistSignUpPage(), AppStatusData, SpecialistOnboardingPage(), specialtyOptions, GoogleIcon(), SpecialistSignUpWizard(), specialtyOptions (+27 more)

### Community 28 - "public-profile/page.tsx"
Cohesion: 0.14
Nodes (28): PublicProfileContent(), PublicProfilePage(), EmptyProfileButton(), ProfileButton, ProfileAboutSection(), ProfileAboutSectionProps, ProfileCompletionCard(), ProfileCompletionCardProps (+20 more)

### Community 29 - "ref_fs"
Cohesion: 0.06
Nodes (22): nextConfig, nextConfig, path, categories, fs, main(), path, prisma (+14 more)

### Community 30 - "ContactHero.tsx"
Cohesion: 0.18
Nodes (12): ContactHero(), MOTIVOS, CustomSelect(), CustomSelectProps, SelectOption, parsePhoneNumber(), PhoneInput(), PhoneInputProps (+4 more)

### Community 31 - "ses.ts"
Cohesion: 0.35
Nodes (7): POST(), POST(), EventRegistrationEmailPayload, sendContactNotificationEmail(), sendEventRegistrationEmail(), verifyTurnstileToken(), ContactNotificationPayload

### Community 32 - "package.json"
Cohesion: 0.05
Nodes (41): auth, data, Schema, dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, devDependencies, @aws-amplify/backend (+33 more)

### Community 33 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, aws-amplify, @aws-amplify/ui-react, @aws-sdk/client-cognito-identity-provider, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner (+11 more)

### Community 34 - "marketing/app/page.tsx"
Cohesion: 0.12
Nodes (17): dynamic, Home(), metadata, revalidate, CATEGORIES, CategoriesGrid(), ContactBanner(), ConversationSection() (+9 more)

### Community 35 - "constants.ts"
Cohesion: 0.21
Nodes (10): getCategoriesAsync(), InterestPill(), InterestPillProps, LEGACY_CATEGORY_MAP, EditInterestsModalProps, ADMIN_COMMUNITY_CATEGORIES, INTEREST_CATEGORIES, LUMINUS_CATEGORY_SUBTITLES (+2 more)

### Community 36 - "marketing/app/especialistas/page.tsx"
Cohesion: 0.12
Nodes (14): dynamic, metadata, revalidate, SpecialistsPage(), SpecialistsClosingCta(), SpecialistsControlBanner(), DISCIPLINES, SpecialistsDisciplines() (+6 more)

### Community 37 - "Step4Spaces.tsx"
Cohesion: 0.18
Nodes (14): getCountryMaxLength(), PhoneInput(), PhoneInputProps, AreaBlock, AreaServicesPills(), PlacesSearchAutocomplete(), SPACE_TYPE_OPTIONS, Step4Clinics (+6 more)

### Community 38 - "FaqAccordionList.tsx"
Cohesion: 0.20
Nodes (13): FaqsPage(), metadata, CategorizedFaqs(), FaqAccordionList(), FaqAccordionListProps, FaqSection(), HOME_FAQ_IDS, SpecialistsFaq() (+5 more)

### Community 39 - "marketing/components/ui/Button.tsx"
Cohesion: 0.24
Nodes (8): CTASection(), CTASectionProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants

### Community 40 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, paths, resolveJsonModule, skipLibCheck (+3 more)

### Community 41 - "entrevistasyencuentros/page.tsx"
Cohesion: 0.17
Nodes (10): dynamic, EntrevistasYEncuentrosPage(), metadata, revalidate, EventsClosingCta(), EventsFaq(), EventsFormatsGrid(), EventsHero() (+2 more)

### Community 42 - "PersonalData.tsx"
Cohesion: 0.09
Nodes (33): UsersTab(), metadata, UnirmePerfilPage(), LocationInput, capitalizeName(), COUNTRY_SYNONYMS, currentYearNum, DAYS (+25 more)

### Community 43 - "Section"
Cohesion: 0.25
Nodes (8): ComparisonColumnProps, ComparisonSection(), ComparisonSectionProps, StepItem, StepsSection(), StepsSectionProps, SectionHeader(), SectionHeaderProps

### Community 44 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+5 more)

### Community 45 - "EventRegistrationSection.tsx"
Cohesion: 0.13
Nodes (19): ContactoClient(), cleanTimeString(), EventItem, EventRegistrationSection(), EventRegistrationSectionProps, formatDateTimeFull(), parseCalendarDate(), parseInlineMarkdown() (+11 more)

### Community 46 - "prisma"
Cohesion: 0.11
Nodes (18): dynamic, runtime, formatBirthdate(), GET(), parseBirthdate(), PATCH(), pickString(), ProfilePromptInput (+10 more)

### Community 47 - "metadata/route.ts"
Cohesion: 0.43
Nodes (7): decodeHTMLEntities(), dynamic, extractMetaTag(), extractTitleTag(), parseFallbackFromUrl(), POST(), runtime

### Community 48 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:deploy, db:generate, db:migrate, db:push, db:seed:interests, db:studio (+4 more)

### Community 49 - "UpcomingEventsTimeline.tsx"
Cohesion: 0.14
Nodes (19): dynamic, GrabacionesListingPage(), metadata, revalidate, deduplicateEvents(), dynamic, metadata, ProximasFechasPage() (+11 more)

### Community 50 - "sender.ts"
Cohesion: 0.28
Nodes (19): POST(), runtime, buildRawLog(), DEFAULT_CONTACT_RECIPIENTS, EmailLogOptions, formatSenderAddress(), isSesConfigured(), logSentEmail() (+11 more)

### Community 51 - "FeatureGrid.tsx"
Cohesion: 0.43
Nodes (5): FeatureCard(), FeatureCardProps, FeatureGridProps, Card(), CardProps

### Community 52 - "marketing/package.json"
Cohesion: 0.05
Nodes (40): dependencies, @aws-sdk/client-ses, @aws-sdk/client-sesv2, lucide-react, @marsidev/react-turnstile, next, react, react-dom (+32 more)

### Community 53 - "Active Agent Skills"
Cohesion: 0.29
Nodes (6): Active Agent Skills, Architecture & Knowledge, Design & UI Craft, Engineering Philosophy, LUMINUS AI Development Guidelines & Skills, Vercel Labs Skills

### Community 54 - "marketing/app/layout.tsx"
Cohesion: 0.32
Nodes (5): jakarta, metadata, RootLayout(), MetaPixel(), META_PIXEL_ID

### Community 55 - "Luminus Platform Backend"
Cohesion: 0.29
Nodes (6): Auth and database, Avatar uploads, Cognito login, Luminus Platform Backend, Password recovery emails, Useful commands

### Community 56 - "red/page.tsx"
Cohesion: 0.17
Nodes (10): MiembrosContent(), MiembrosPage(), ConnectionItem, NetworkContent(), NetworkPage(), ProfileDetails, MobileMembersCarousel(), MobileMembersCarouselProps (+2 more)

### Community 57 - "mockPostsData.ts"
Cohesion: 0.29
Nodes (4): INITIAL_MOCK_POSTS, LEGACY_MOCK_AUTHORS, LEGACY_MOCK_IDS, POSTS_STORAGE_KEY

### Community 58 - "Button"
Cohesion: 0.16
Nodes (17): EspaciosPage(), FaroPage(), GruposPage(), Button(), ButtonProps, EmptyProfileButtonProps, ProfileButtonProps, SquareButtonProps (+9 more)

### Community 59 - "migrate-legacy-courses.cjs"
Cohesion: 0.29
Nodes (4): fs, path, prisma, { PrismaClient }

### Community 60 - "stripe.ts"
Cohesion: 0.28
Nodes (7): POST(), runtime, createMembershipSubscription(), CreateSubscriptionResult, isStripeConfigured, stripe, stripe

### Community 61 - "notificaciones/page.tsx"
Cohesion: 0.19
Nodes (13): FILTERS, Notification, NotificationsContent(), NotificationsPage(), DotSpinner(), DotSpinnerProps, NotificationItem(), NotificationItemProps (+5 more)

### Community 63 - "local-unsubscribe-helper.ts"
Cohesion: 0.34
Nodes (13): createSentEmailRecord(), filterUnsubscribedEmails(), generateUnsubscribeToken(), generateUnsubscribeUrls(), getBaseUrl(), injectAnalyticsTracking(), normalizeEmail(), prepareCampaignEmail() (+5 more)

### Community 64 - "EditPostModal.tsx"
Cohesion: 0.21
Nodes (15): CreatePostCard(), CreatePostCardProps, extractYouTubeId(), htmlToMarkdown(), traverse(), EditPostModal(), EditPostModalProps, extractYouTubeId() (+7 more)

### Community 66 - "@prisma/client"
Cohesion: 0.25
Nodes (4): prisma, { PrismaClient }, { PrismaClient }, @prisma/client

### Community 68 - "contacts.sql"
Cohesion: 0.83
Nodes (3): idx_contact_messages_created_at, idx_contact_messages_email, public.contact_messages

### Community 76 - "SelectInput"
Cohesion: 0.13
Nodes (15): SelectInput, SelectInputProps, daysOfWeek, hoursOptions, Step3Sessions(), Step3SessionsProps, TIMEZONE_OPTIONS, currentYearNum (+7 more)

### Community 77 - "comunidad/page.tsx"
Cohesion: 0.16
Nodes (12): PlatformContent(), PlatformPage(), RecentMembersCard(), RecentMembersCardProps, EventItem, formatSpeakerName(), formatUpcomingDateHeader(), MONTH_NAMES_ES (+4 more)

### Community 79 - "email/request/route.ts"
Cohesion: 0.18
Nodes (16): isValidEmail(), POST(), runtime, POST(), runtime, POST(), runtime, POST() (+8 more)

### Community 81 - "platform/app/layout.tsx"
Cohesion: 0.19
Nodes (9): inter, jakarta, metadata, RootLayout(), viewport, MetaPixel(), META_PIXEL_ID, trackMetaEvent() (+1 more)

### Community 83 - "seed-test-upcoming-events.cjs"
Cohesion: 0.25
Nodes (6): dbUrl, fs, line, lines, prisma, { PrismaClient }

### Community 84 - "cognito-password.ts"
Cohesion: 0.08
Nodes (46): CognitoIdentityClaim, CognitoIdTokenClaims, CognitoStartState, CognitoTokenResponse, CognitoUserInfo, exchangeCodeForAccessToken(), fetchCognitoUser(), GET() (+38 more)

### Community 85 - "seed-events.cjs"
Cohesion: 0.33
Nodes (6): fs, generateSlug(), path, prisma, { PrismaClient }, seed()

### Community 86 - "MembershipPaymentView.tsx"
Cohesion: 0.31
Nodes (6): metadata, UnirmePagoPage(), BillingAddressData, BillingAddressInput(), BillingAddressInputProps, MembershipPaymentView()

### Community 87 - "InputField"
Cohesion: 0.16
Nodes (16): ForgotPasswordPage(), metadata, TurnstileWidget(), TurnstileWidgetProps, InputField, InputFieldProps, Course, SpecialistPostulationModal() (+8 more)

### Community 98 - "posts/[id]/route.ts"
Cohesion: 0.18
Nodes (12): DELETE(), extractYoutubeId(), POST(), DELETE(), PATCH(), runtime, DELETE(), POST() (+4 more)

### Community 100 - "onboarding/profile/route.ts"
Cohesion: 0.24
Nodes (7): POST(), runtime, parseBirthdate(), POST(), runtime, slugify(), ensureS3AvatarUrl()

### Community 101 - "IntroSessionScheduler.tsx"
Cohesion: 0.23
Nodes (11): Availability, dateKey(), DAY_LABELS, formatMinutes(), IntroSessionScheduler(), mondayIndex(), MONTH_LABELS, Props (+3 more)

### Community 102 - "sweep-orphan-s3-files.cjs"
Cohesion: 0.28
Nodes (7): { Client }, DRY_RUN, getActiveReferencedKeys(), listAllS3Objects(), run(), s3, { S3Client, ListObjectsV2Command, DeleteObjectsCommand }

### Community 103 - "[slug]/page.tsx"
Cohesion: 0.36
Nodes (7): dynamic, DynamicEventRegistrationPage(), generateMetadata(), getEventBySlug(), getImageMimeType(), PageProps, revalidate

### Community 108 - "platform/app/especialistas/page.tsx"
Cohesion: 0.50
Nodes (4): ApplicationStatus, EspecialistasPage(), Specialist, SpecialistCard()

### Community 109 - "ref_lucide_react"
Cohesion: 0.20
Nodes (3): FAQCategory, FAQItem, TrustSectionProps

## Knowledge Gaps
- **50 isolated node(s):** `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2`, `@marsidev/react-turnstile`, `lucide-react` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 750 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `@prisma/client` to `platform/lib/db.ts`, `fetch_videos.js`, `users/route.ts`, `platform/package.json`, `unsubscribe/route.ts`, `ref_fs`, `migrate-legacy-courses.cjs`, `local-unsubscribe-helper.ts`, `seed-test-upcoming-events.cjs`, `seed-events.cjs`, `audit-emails.cjs`, `check-admin-user.cjs`, `fix-and-normalize-categories.cjs`, `fix-event-dates.cjs`, `make-gabriel-admin.cjs`, `onboarding/profile/route.ts`, `audit-categories.cjs`, `clean-false-events.cjs`, `make-specialist.cjs`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14082503556187767 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `EditPostModal.tsx`, `AdminUsersClient.tsx`, `ref_next`, `constants.ts`, `Step4Spaces.tsx`, `IntroSessionScheduler.tsx`, `ref_react`, `PersonalData.tsx`, `SelectInput`, `PostCard.tsx`, `MembershipPaymentView.tsx`, `InputField`, `red/page.tsx`, `SpecialistSignUpWizard.tsx`, `public-profile/page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `AdminUsersClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05967540574282147 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `platform/package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._