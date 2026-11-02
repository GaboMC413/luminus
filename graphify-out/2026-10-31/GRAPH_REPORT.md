# Graph Report - luminus  (2026-10-31)

## Corpus Check
- 459 files · ~3,560,306 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: (none) 6, .css 4, .example 2)

## Summary
- 2091 nodes · 5257 edges · 109 communities (89 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6b58c64`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.ts
- AdminUsersClient.tsx
- PageLoader
- PlatformNavbar.tsx
- "users"
- platform/lib/db.ts
- fetch_videos.js
- resumeStorage.ts
- MembershipSection.tsx
- comunidad/page.tsx
- platform/package.json
- Footer
- ref_next
- EditableField.tsx
- isUuid
- empresas-aliadas/page.tsx
- sobre-nosotros/page.tsx
- events.ts
- renderEmailLayout
- serializePost
- unsubscribe/route.ts
- ProfileSidebar.tsx
- marketing/PricingSection.tsx
- README.md
- clearSessionCookie
- compilerOptions
- compilerOptions
- SpecialistSignUpWizard.tsx
- sender.ts
- ref_fs
- ContactHero.tsx
- red/page.tsx
- package.json
- dependencies
- marketing/app/page.tsx
- callback/route.ts
- marketing/app/especialistas/page.tsx
- ProfileMembershipCard.tsx
- FaqAccordionList.tsx
- password/route.ts
- compilerOptions
- entrevistasyencuentros/page.tsx
- CompleteProfileView.tsx
- Section
- devDependencies
- EventRegistrationSection.tsx
- prisma
- metadata/route.ts
- scripts
- UpcomingEventsTimeline.tsx
- categories/reset/route.ts
- FeatureGrid.tsx
- marketing/package.json
- Active Agent Skills
- marketing/app/layout.tsx
- Luminus Platform Backend
- devDependencies
- cognito-admin.ts
- seed-interests.cjs
- getCurrentSession
- MembershipChoiceView.tsx
- registration-error/route.ts
- local-unsubscribe-helper.ts
- platform/app/especialistas/page.tsx
- Reglas del Proyecto LUMINUS (AGENTS.md)
- ref_prisma_client
- CODE_OF_CONDUCT.md
- contacts.sql
- amplify/package.json
- PostCard.tsx
- getCurrentSession
- email/request/route.ts
- ProfileContent.tsx
- platform/app/layout.tsx
- SelectInput
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
- session.ts
- GEMINI.md
- Step4Spaces.tsx
- marketing/components/ui/Button.tsx
- audit-categories.cjs
- platform/next.config.js
- clean-false-events.cjs
- [slug]/page.tsx
- backend.ts
- migrate-legacy-courses.cjs
- scripts
- vitest.config.mts
- ref_lucide_react
- dependencies
- make-specialist.cjs
- overrides
- engines

## God Nodes (most connected - your core abstractions)
1. `getCurrentSession()` - 140 edges
2. `Button()` - 108 edges
3. `InputField` - 55 edges
4. `PageLoader()` - 51 edges
5. `Modal()` - 49 edges
6. `SelectInput` - 36 edges
7. `isUuid()` - 32 edges
8. `Footer()` - 29 edges
9. `Navbar()` - 29 edges
10. `PlatformNavbar()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `loadConversations()` --calls--> `isUuid()`  [EXTRACTED]
  apps/platform/app/mensajes/page.tsx → apps/platform/utils/validation.ts
- `CreatePostCardProps` --references--> `PostItem`  [EXTRACTED]
  apps/platform/components/community/CreatePostCard.tsx → apps/platform/components/community/mockPostsData.ts
- `EditPostModalProps` --references--> `PostItem`  [EXTRACTED]
  apps/platform/components/community/EditPostModal.tsx → apps/platform/components/community/mockPostsData.ts
- `PostCardProps` --references--> `PostItem`  [EXTRACTED]
  apps/platform/components/community/PostCard.tsx → apps/platform/components/community/mockPostsData.ts
- `ContactoClient()` --calls--> `TurnstileWidget()`  [EXTRACTED]
  apps/marketing/app/contacto/ContactoClient.tsx → apps/marketing/components/TurnstileWidget.tsx

## Import Cycles
- None detected.

## Communities (109 total, 20 thin omitted)

### Community 0 - "session.ts"
Cohesion: 0.19
Nodes (21): POST(), runtime, POST(), runtime, POST(), runtime, POST(), runtime (+13 more)

### Community 1 - "AdminUsersClient.tsx"
Cohesion: 0.05
Nodes (68): AdminUsersClient(), AdminBadge(), AdminBadgeProps, AdminCard(), AdminCardProps, AdminDetailRow(), AdminDetailRowProps, AdminSectionHeaderProps (+60 more)

### Community 2 - "PageLoader"
Cohesion: 0.12
Nodes (17): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+9 more)

### Community 3 - "PlatformNavbar.tsx"
Cohesion: 0.07
Nodes (55): CommunityLayout(), EspaciosLayout(), EspecialistasLayoutClient(), EspecialistasLayout(), FaroLayout(), GruposLayout(), MapLayout(), MessagesLayout() (+47 more)

### Community 4 - ""users""
Cohesion: 0.06
Nodes (43): "interest_categories", interest_categories_slug_key, "interests", interests_slug_key, "user_interests", "user_profiles", "users", users_cognito_sub_key (+35 more)

### Community 5 - "platform/lib/db.ts"
Cohesion: 0.08
Nodes (30): DELETE(), GET(), PATCH(), POST(), PUT(), runtime, slugify(), DELETE() (+22 more)

### Community 6 - "fetch_videos.js"
Cohesion: 0.09
Nodes (26): autoCategorize(), decodeHtmlEntities(), delay(), extractVideosFromData(), fetchUrl(), fs, guessSpeaker(), https (+18 more)

### Community 7 - "resumeStorage.ts"
Cohesion: 0.05
Nodes (63): ALLOWED_CONTENT_TYPES, extensionForContentType(), POST(), runtime, DELETE(), describeAdminUpdateError(), GET(), PATCH() (+55 more)

### Community 8 - "MembershipSection.tsx"
Cohesion: 0.06
Nodes (48): PhoneSettingsPage(), PasswordSettingsPage(), EmailSettingsPage(), MembershipSettingsPage(), PersonalSettingsPage(), Modal(), ModalProps, AccountClosureModal() (+40 more)

### Community 9 - "comunidad/page.tsx"
Cohesion: 0.11
Nodes (18): PlatformContent(), PlatformPage(), SETTINGS_TABS, SettingsLayout(), SettingsLayoutContent(), RecentMembersCard(), RecentMembersCardProps, EventItem (+10 more)

### Community 10 - "platform/package.json"
Cohesion: 0.07
Nodes (27): autoprefixer, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner, lucide-react, @marsidev/react-turnstile, next (+19 more)

### Community 11 - "Footer"
Cohesion: 0.17
Nodes (16): ContactoPage(), metadata, DesuscribirPage(), UnsubscribeContent(), CondicionesEspecialistasPage(), metadata, CookiesPage(), metadata (+8 more)

### Community 12 - "ref_next"
Cohesion: 0.06
Nodes (8): dynamic, GET(), runtime, dynamic, runtime, runtime, WelcomeBannerProps, isAllowedLegacyResumeUrl()

### Community 13 - "EditableField.tsx"
Cohesion: 0.12
Nodes (22): InputField, InputFieldProps, LocationInput, LocationInputProps, EditableField(), EditableFieldProps, currentYearNum, DAYS (+14 more)

### Community 14 - "isUuid"
Cohesion: 0.08
Nodes (39): dynamic, POST(), runtime, GET(), MOCK_PROFILES, runtime, POST(), runtime (+31 more)

### Community 15 - "empresas-aliadas/page.tsx"
Cohesion: 0.24
Nodes (12): EmpresasAliadasPage(), metadata, BenefitItem, BenefitsGrid(), BenefitsGridProps, FeatureGrid(), PricingSection(), Container() (+4 more)

### Community 16 - "sobre-nosotros/page.tsx"
Cohesion: 0.19
Nodes (13): metadata, SobreNosotrosPage(), PlatformSection(), PlatformSectionProps, ProblemSection(), ProblemSectionProps, Hero(), HeroProps (+5 more)

### Community 17 - "events.ts"
Cohesion: 0.11
Nodes (30): EventCard(), EventCardProps, EventItem, formatDate(), formatUpcomingDateHeader(), getYoutubeId(), isSpeakerNameValid(), MONTH_NAMES_ES (+22 more)

### Community 18 - "renderEmailLayout"
Cohesion: 0.12
Nodes (22): ContactEmailPreviewPage(), EmailChangePreviewPage(), EmailPreviewPage(), PasswordResetEmailPreviewPage(), WelcomeEmailPreviewPage(), ContactNotificationEmailOptions, renderContactNotificationEmailHtml(), renderEmailChangeVerificationHtml() (+14 more)

### Community 19 - "serializePost"
Cohesion: 0.10
Nodes (21): dynamic, GET(), PATCH(), runtime, POST(), runtime, PATCH(), runtime (+13 more)

### Community 20 - "unsubscribe/route.ts"
Cohesion: 0.07
Nodes (39): POST(), POST(), dynamic, runtime, dynamic, GET(), isAllowedDestination(), runtime (+31 more)

### Community 21 - "ProfileSidebar.tsx"
Cohesion: 0.18
Nodes (15): Availability, dateKey(), DAY_LABELS, formatMinutes(), IntroSessionScheduler(), mondayIndex(), MONTH_LABELS, Props (+7 more)

### Community 22 - "marketing/PricingSection.tsx"
Cohesion: 0.70
Nodes (3): PricingCard(), PricingCardProps, PricingSectionProps

### Community 23 - "README.md"
Cohesion: 0.10
Nodes (18): Code of Conduct, Contributing Guidelines, Contributing via Pull Requests, Finding contributions to work on, Licensing, Reporting Bugs/Feature Requests, Security issue notifications, 1. Database-Connected Mode (Default & Dev Connection) (+10 more)

### Community 24 - "clearSessionCookie"
Cohesion: 0.19
Nodes (11): POST(), runtime, DELETE(), runtime, GET(), getCognitoDomain(), POST(), runtime (+3 more)

### Community 25 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 26 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 27 - "SpecialistSignUpWizard.tsx"
Cohesion: 0.08
Nodes (43): metadata, SpecialistSignUpPage(), EspaciosPage(), AppStatusData, SpecialistOnboardingPage(), specialtyOptions, FaroPage(), GruposPage() (+35 more)

### Community 28 - "sender.ts"
Cohesion: 0.29
Nodes (18): EventRegistrationEmailPayload, buildRawLog(), ContactNotificationPayload, DEFAULT_CONTACT_RECIPIENTS, EmailLogOptions, formatSenderAddress(), isSesConfigured(), logSentEmail() (+10 more)

### Community 29 - "ref_fs"
Cohesion: 0.07
Nodes (18): envPath, __dirname, envPath, __filename, isExecute, prisma, stripe, envPath (+10 more)

### Community 30 - "ContactHero.tsx"
Cohesion: 0.18
Nodes (12): ContactHero(), MOTIVOS, CustomSelect(), CustomSelectProps, SelectOption, parsePhoneNumber(), PhoneInput(), PhoneInputProps (+4 more)

### Community 31 - "red/page.tsx"
Cohesion: 0.17
Nodes (10): MiembrosContent(), MiembrosPage(), ConnectionItem, NetworkContent(), NetworkPage(), ProfileDetails, MobileMembersCarousel(), MobileMembersCarouselProps (+2 more)

### Community 32 - "package.json"
Cohesion: 0.12
Nodes (16): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @types/node, @types/react, @types/react-dom, typescript, name, private (+8 more)

### Community 33 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, @aws-sdk/client-cognito-identity-provider, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner, libphonenumber-js, lucide-react (+10 more)

### Community 34 - "marketing/app/page.tsx"
Cohesion: 0.12
Nodes (17): dynamic, Home(), metadata, revalidate, CATEGORIES, CategoriesGrid(), ContactBanner(), ConversationSection() (+9 more)

### Community 35 - "callback/route.ts"
Cohesion: 0.19
Nodes (17): CognitoIdentityClaim, CognitoIdTokenClaims, CognitoStartState, CognitoTokenResponse, CognitoUserInfo, exchangeCodeForAccessToken(), fetchCognitoUser(), GET() (+9 more)

### Community 36 - "marketing/app/especialistas/page.tsx"
Cohesion: 0.12
Nodes (14): dynamic, metadata, revalidate, SpecialistsPage(), SpecialistsClosingCta(), SpecialistsControlBanner(), DISCIPLINES, SpecialistsDisciplines() (+6 more)

### Community 37 - "ProfileMembershipCard.tsx"
Cohesion: 0.31
Nodes (8): MembershipState, useMembership(), MONTHS, ProfileMembershipCardProps, getMembershipDisplay(), isMecenas(), MembershipTier, UserSubscriptionContext

### Community 38 - "FaqAccordionList.tsx"
Cohesion: 0.20
Nodes (13): FaqsPage(), metadata, CategorizedFaqs(), FaqAccordionList(), FaqAccordionListProps, FaqSection(), HOME_FAQ_IDS, SpecialistsFaq() (+5 more)

### Community 39 - "password/route.ts"
Cohesion: 0.47
Nodes (3): PATCH(), runtime, hashPassword()

### Community 40 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, paths, resolveJsonModule, skipLibCheck (+3 more)

### Community 41 - "entrevistasyencuentros/page.tsx"
Cohesion: 0.17
Nodes (10): dynamic, EntrevistasYEncuentrosPage(), metadata, revalidate, EventsClosingCta(), EventsFaq(), EventsFormatsGrid(), EventsHero() (+2 more)

### Community 42 - "CompleteProfileView.tsx"
Cohesion: 0.08
Nodes (36): UsersTab(), metadata, UnirmePerfilPage(), getCountryMaxLength(), PhoneInput(), PhoneInputProps, capitalizeName(), COUNTRY_SYNONYMS (+28 more)

### Community 43 - "Section"
Cohesion: 0.25
Nodes (8): ComparisonColumnProps, ComparisonSection(), ComparisonSectionProps, StepItem, StepsSection(), StepsSectionProps, SectionHeader(), SectionHeaderProps

### Community 44 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+6 more)

### Community 45 - "EventRegistrationSection.tsx"
Cohesion: 0.13
Nodes (19): ContactoClient(), cleanTimeString(), EventItem, EventRegistrationSection(), EventRegistrationSectionProps, formatDateTimeFull(), parseCalendarDate(), parseInlineMarkdown() (+11 more)

### Community 46 - "prisma"
Cohesion: 0.14
Nodes (20): DELETE(), GET(), PATCH(), runtime, serializeNotification(), formatBirthdate(), GET(), parseBirthdate() (+12 more)

### Community 47 - "metadata/route.ts"
Cohesion: 0.27
Nodes (9): decodeHTMLEntities(), dynamic, extractMetaTag(), extractTitleTag(), isPrivateIp(), parseFallbackFromUrl(), POST(), runtime (+1 more)

### Community 48 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:deploy, db:generate, db:migrate, db:push, db:seed:interests, db:studio (+4 more)

### Community 49 - "UpcomingEventsTimeline.tsx"
Cohesion: 0.14
Nodes (19): dynamic, GrabacionesListingPage(), metadata, revalidate, deduplicateEvents(), dynamic, metadata, ProximasFechasPage() (+11 more)

### Community 50 - "categories/reset/route.ts"
Cohesion: 0.50
Nodes (4): defaultCategories, POST(), runtime, slugify()

### Community 51 - "FeatureGrid.tsx"
Cohesion: 0.43
Nodes (5): FeatureCard(), FeatureCardProps, FeatureGridProps, Card(), CardProps

### Community 52 - "marketing/package.json"
Cohesion: 0.05
Nodes (42): dependencies, @aws-sdk/client-ses, @aws-sdk/client-sesv2, lucide-react, @marsidev/react-turnstile, next, @prisma/client, react (+34 more)

### Community 53 - "Active Agent Skills"
Cohesion: 0.20
Nodes (9): Active Agent Skills, Architecture & Knowledge, AWS Guidance, Before you conclude, Design & UI Craft, Engineering Philosophy, LUMINUS AI Development Guidelines & Skills, Secret Safety (+1 more)

### Community 54 - "marketing/app/layout.tsx"
Cohesion: 0.32
Nodes (5): jakarta, metadata, RootLayout(), MetaPixel(), META_PIXEL_ID

### Community 55 - "Luminus Platform Backend"
Cohesion: 0.29
Nodes (6): Auth and database, Avatar uploads, Cognito login, Luminus Platform Backend, Password recovery emails, Useful commands

### Community 56 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, @aws-amplify/backend, @aws-amplify/backend-cli, aws-cdk, aws-cdk-lib, constructs, esbuild, tsx (+4 more)

### Community 57 - "cognito-admin.ts"
Cohesion: 0.44
Nodes (10): adminConfirmUser(), adminCreateAndConfirmUser(), adminDeleteCognitoUser(), CognitoManagedUser, getCognitoAdminClient(), getCognitoUsername(), getUserPoolId(), isSystemUser() (+2 more)

### Community 58 - "seed-interests.cjs"
Cohesion: 0.25
Nodes (7): categories, fs, main(), path, prisma, { PrismaClient }, slugify()

### Community 60 - "getCurrentSession"
Cohesion: 0.07
Nodes (29): GET(), runtime, POST(), runtime, POST(), runtime, POST(), runtime (+21 more)

### Community 61 - "MembershipChoiceView.tsx"
Cohesion: 0.39
Nodes (5): MembresiaPage(), metadata, metadata, UnirmePage(), MembershipChoiceView()

### Community 62 - "registration-error/route.ts"
Cohesion: 0.53
Nodes (5): getClientIp(), isValidOrigin(), POST(), runtime, sendRegistrationErrorAlertEmail()

### Community 63 - "local-unsubscribe-helper.ts"
Cohesion: 0.34
Nodes (13): createSentEmailRecord(), filterUnsubscribedEmails(), generateUnsubscribeToken(), generateUnsubscribeUrls(), getBaseUrl(), injectAnalyticsTracking(), normalizeEmail(), prepareCampaignEmail() (+5 more)

### Community 64 - "platform/app/especialistas/page.tsx"
Cohesion: 0.50
Nodes (4): ApplicationStatus, EspecialistasPage(), Specialist, SpecialistCard()

### Community 66 - "ref_prisma_client"
Cohesion: 0.25
Nodes (3): prisma, { PrismaClient }, { PrismaClient }

### Community 68 - "contacts.sql"
Cohesion: 0.83
Nodes (3): idx_contact_messages_created_at, idx_contact_messages_email, public.contact_messages

### Community 77 - "PostCard.tsx"
Cohesion: 0.11
Nodes (26): CommunityReportModal(), CommunityReportModalProps, REPORT_REASONS, CreatePostCard(), CreatePostCardProps, extractYouTubeId(), htmlToMarkdown(), traverse() (+18 more)

### Community 78 - "getCurrentSession"
Cohesion: 0.09
Nodes (28): DELETE(), PATCH(), POST(), runtime, slugify(), GET(), runtime, POST() (+20 more)

### Community 79 - "email/request/route.ts"
Cohesion: 0.20
Nodes (16): isValidEmail(), POST(), runtime, getClientIp(), POST(), runtime, POST(), runtime (+8 more)

### Community 80 - "ProfileContent.tsx"
Cohesion: 0.17
Nodes (21): PublicProfileContent(), PublicProfilePage(), EmptyProfileButton(), ProfileButton, ProfileAboutSection(), ProfileAboutSectionProps, ProfileCompletionCard(), ProfileCompletionCardProps (+13 more)

### Community 81 - "platform/app/layout.tsx"
Cohesion: 0.19
Nodes (9): inter, jakarta, metadata, RootLayout(), viewport, MetaPixel(), META_PIXEL_ID, trackMetaEvent() (+1 more)

### Community 82 - "SelectInput"
Cohesion: 0.13
Nodes (15): EmailLogsTab(), templatesData, ButtonProps, EmptyProfileButtonProps, ProfileButtonProps, SquareButtonProps, SelectInput, SelectInputProps (+7 more)

### Community 83 - "seed-test-upcoming-events.cjs"
Cohesion: 0.25
Nodes (6): dbUrl, fs, line, lines, prisma, { PrismaClient }

### Community 84 - "cognito-password.ts"
Cohesion: 0.15
Nodes (23): POST(), runtime, POST(), runtime, CognitoAuthResponse, CognitoError, CognitoIdTokenPayload, cognitoRequest() (+15 more)

### Community 85 - "seed-events.cjs"
Cohesion: 0.33
Nodes (6): fs, generateSlug(), path, prisma, { PrismaClient }, seed()

### Community 86 - "MembershipPaymentView.tsx"
Cohesion: 0.24
Nodes (11): BillingAddressData, BillingAddressInput(), BillingAddressInputProps, ELEMENT_STYLE, isPlaceholderEmail(), MembershipPaymentView(), fetchProfileData(), PaymentForm() (+3 more)

### Community 87 - "InputField"
Cohesion: 0.14
Nodes (19): ForgotPasswordPage(), metadata, TurnstileWidget(), TurnstileWidgetProps, ForgotPasswordView(), formatName(), GoogleIcon(), SignUpView() (+11 more)

### Community 93 - "session.ts"
Cohesion: 0.15
Nodes (16): POST(), runtime, dynamic, GET(), runTest(), runtime, sanitizeError(), IniciarSesionPage() (+8 more)

### Community 95 - "Step4Spaces.tsx"
Cohesion: 0.14
Nodes (16): AreaBlock, PlacesSearchAutocomplete(), SPACE_TYPE_OPTIONS, Step4Clinics, Step4SpacesProps, SpaceServiceItem, SettingsContext, SettingsContextType (+8 more)

### Community 96 - "marketing/components/ui/Button.tsx"
Cohesion: 0.24
Nodes (8): CTASection(), CTASectionProps, Button, ButtonProps, ButtonSize, ButtonVariant, sizes, variants

### Community 98 - "platform/next.config.js"
Cohesion: 0.33
Nodes (3): nextConfig, nextConfig, path

### Community 103 - "[slug]/page.tsx"
Cohesion: 0.36
Nodes (7): dynamic, DynamicEventRegistrationPage(), generateMetadata(), getEventBySlug(), getImageMimeType(), PageProps, revalidate

### Community 104 - "backend.ts"
Cohesion: 0.48
Nodes (4): auth, data, Schema, @aws-amplify/backend

### Community 105 - "migrate-legacy-courses.cjs"
Cohesion: 0.29
Nodes (4): fs, path, prisma, { PrismaClient }

### Community 106 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build:marketing, build:platform, dev:marketing, dev:platform, test:platform

### Community 108 - "vitest.config.mts"
Cohesion: 0.33
Nodes (3): __dirname, __filename, vitest

### Community 109 - "ref_lucide_react"
Cohesion: 0.20
Nodes (3): FAQCategory, FAQItem, TrustSectionProps

### Community 111 - "dependencies"
Cohesion: 0.67
Nodes (3): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Community 113 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, handlebars, postcss

## Knowledge Gaps
- **50 isolated node(s):** `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2`, `@marsidev/react-turnstile`, `@prisma/client` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 799 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `platform/package.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdminUsersClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.050693069306930696 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `SpecialistSignUpWizard.tsx` to `AdminUsersClient.tsx`, `PlatformNavbar.tsx`, `MembershipSection.tsx`, `CompleteProfileView.tsx`, `PostCard.tsx`, `EditableField.tsx`, `ProfileContent.tsx`, `SelectInput`, `ProfileSidebar.tsx`, `MembershipPaymentView.tsx`, `InputField`, `MembershipChoiceView.tsx`, `Step4Spaces.tsx`, `red/page.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.12258064516129032 - nodes in this community are weakly interconnected._
- **Why does `getCurrentSession()` connect `getCurrentSession` to `session.ts`, `AdminUsersClient.tsx`, `PlatformNavbar.tsx`, `platform/lib/db.ts`, `password/route.ts`, `resumeStorage.ts`, `ref_next`, `isUuid`, `email/request/route.ts`, `metadata/route.ts`, `prisma`, `categories/reset/route.ts`, `serializePost`, `clearSessionCookie`, `getCurrentSession`, `session.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `PlatformNavbar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06523855890944498 - nodes in this community are weakly interconnected._