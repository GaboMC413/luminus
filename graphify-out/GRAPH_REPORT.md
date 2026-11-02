# Graph Report - luminus  (2026-10-31)

## Corpus Check
- 454 files · ~3,556,297 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: (none) 6, .css 4, .example 2)

## Summary
- 2076 nodes · 5204 edges · 119 communities (97 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `162cb8e3`
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
- SettingsContext.tsx
- configuracion/layout.tsx
- platform/package.json
- Footer
- complete-follow/route.ts
- EditPersonalInfoModal.tsx
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
- inicio/page.tsx
- package.json
- dependencies
- marketing/app/page.tsx
- callback/route.ts
- marketing/app/especialistas/page.tsx
- ProfileMembershipCard.tsx
- FaqAccordionList.tsx
- platform/components/ui/Button.tsx
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
- users/route.ts
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
- EditPostModal.tsx
- getCurrentSession
- email/request/route.ts
- ProfileContent.tsx
- platform/app/layout.tsx
- Modal
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
- Step2Profile.tsx
- audit-categories.cjs
- platform/next.config.js
- constants.ts
- clean-false-events.cjs
- createSessionToken
- miembros/page.tsx
- events.ts
- backend.ts
- dedupe-stripe-customers.mjs
- scripts
- UpcomingEventsCarousel.tsx
- notifications/route.ts
- ref_lucide_react
- inscription.ts
- dependencies
- make-specialist.cjs
- overrides
- engines
- runtime/route.ts
- NotificationPopup.tsx
- notify-live/route.ts

## God Nodes (most connected - your core abstractions)
1. `getCurrentSession()` - 140 edges
2. `Button()` - 108 edges
3. `InputField` - 53 edges
4. `PageLoader()` - 51 edges
5. `Modal()` - 49 edges
6. `SelectInput` - 36 edges
7. `isUuid()` - 32 edges
8. `Footer()` - 29 edges
9. `Navbar()` - 29 edges
10. `PlatformNavbar()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `RecordingsGridProps` --references--> `EventItem`  [EXTRACTED]
  apps/marketing/components/events/RecordingsGrid.tsx → apps/marketing/components/events/EventCard.tsx
- `loadConversations()` --calls--> `isUuid()`  [EXTRACTED]
  apps/platform/app/mensajes/page.tsx → apps/platform/utils/validation.ts
- `ContactoClient()` --calls--> `TurnstileWidget()`  [EXTRACTED]
  apps/marketing/app/contacto/ContactoClient.tsx → apps/marketing/components/TurnstileWidget.tsx
- `ContactoPage()` --calls--> `ContactHero()`  [EXTRACTED]
  apps/marketing/app/contacto/page.tsx → apps/marketing/components/contact/ContactHero.tsx
- `EmpresasAliadasPage()` --calls--> `BenefitsGrid()`  [EXTRACTED]
  apps/marketing/app/empresas-aliadas/page.tsx → apps/marketing/components/marketing/BenefitsGrid.tsx

## Import Cycles
- None detected.

## Communities (119 total, 22 thin omitted)

### Community 0 - "session.ts"
Cohesion: 0.19
Nodes (13): POST(), runtime, POST(), runtime, getCognitoErrorMessage(), getCognitoErrorStatus(), AuthValidationResult, serializeUser() (+5 more)

### Community 1 - "AdminUsersClient.tsx"
Cohesion: 0.06
Nodes (60): AdminUsersClient(), AdminBadge(), AdminBadgeProps, AdminCard(), AdminCardProps, AdminDetailRow(), AdminDetailRowProps, AdminSectionHeaderProps (+52 more)

### Community 2 - "PageLoader"
Cohesion: 0.10
Nodes (25): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+17 more)

### Community 3 - "PlatformNavbar.tsx"
Cohesion: 0.12
Nodes (29): EspaciosLayout(), EspecialistasLayoutClient(), EspecialistasLayout(), FaroLayout(), GruposLayout(), CommunityLayout(), MapLayout(), MessagesLayout() (+21 more)

### Community 4 - ""users""
Cohesion: 0.06
Nodes (43): "interest_categories", interest_categories_slug_key, "interests", interests_slug_key, "user_interests", "user_profiles", "users", users_cognito_sub_key (+35 more)

### Community 5 - "platform/lib/db.ts"
Cohesion: 0.08
Nodes (25): DELETE(), PATCH(), POST(), runtime, slugify(), GET(), runtime, dynamic (+17 more)

### Community 6 - "fetch_videos.js"
Cohesion: 0.09
Nodes (26): autoCategorize(), decodeHtmlEntities(), delay(), extractVideosFromData(), fetchUrl(), fs, guessSpeaker(), https (+18 more)

### Community 7 - "resumeStorage.ts"
Cohesion: 0.07
Nodes (47): ALLOWED_CONTENT_TYPES, extensionForContentType(), POST(), runtime, executePurge(), GET(), POST(), runtime (+39 more)

### Community 8 - "SettingsContext.tsx"
Cohesion: 0.16
Nodes (19): PhoneSettingsPage(), PasswordSettingsPage(), EmailSettingsPage(), MembershipSettingsPage(), PersonalSettingsPage(), EditableField(), EmailSection(), EmailSectionProps (+11 more)

### Community 9 - "configuracion/layout.tsx"
Cohesion: 0.23
Nodes (9): SETTINGS_TABS, SettingsLayout(), SettingsLayoutContent(), Toast(), ToastProps, AccountClosureModal(), AccountClosureModalProps, CLOSURE_REASONS (+1 more)

### Community 10 - "platform/package.json"
Cohesion: 0.07
Nodes (27): autoprefixer, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner, lucide-react, @marsidev/react-turnstile, next (+19 more)

### Community 11 - "Footer"
Cohesion: 0.10
Nodes (16): ContactoPage(), metadata, DesuscribirPage(), UnsubscribeContent(), CondicionesEspecialistasPage(), metadata, CookiesPage(), metadata (+8 more)

### Community 13 - "EditPersonalInfoModal.tsx"
Cohesion: 0.25
Nodes (8): currentYearNum, DAYS, EditPersonalInfoModal(), EditPersonalInfoModalProps, isValidBirthdate(), MONTHS, ProfileData, YEARS

### Community 14 - "isUuid"
Cohesion: 0.08
Nodes (39): dynamic, POST(), runtime, GET(), MOCK_PROFILES, runtime, POST(), runtime (+31 more)

### Community 15 - "empresas-aliadas/page.tsx"
Cohesion: 0.26
Nodes (8): metadata, BenefitItem, BenefitsGrid(), BenefitsGridProps, Container(), bgClasses, SectionProps, empresasAliadasContent

### Community 16 - "sobre-nosotros/page.tsx"
Cohesion: 0.21
Nodes (16): EmpresasAliadasPage(), metadata, SobreNosotrosPage(), PlatformSection(), PlatformSectionProps, ProblemSection(), ProblemSectionProps, CTASection() (+8 more)

### Community 17 - "events.ts"
Cohesion: 0.14
Nodes (24): EventCard(), EventCardProps, EventItem, formatDate(), formatUpcomingDateHeader(), getYoutubeId(), isSpeakerNameValid(), MONTH_NAMES_ES (+16 more)

### Community 18 - "renderEmailLayout"
Cohesion: 0.15
Nodes (16): ContactEmailPreviewPage(), EmailChangePreviewPage(), EmailPreviewPage(), PasswordResetEmailPreviewPage(), WelcomeEmailPreviewPage(), ContactNotificationEmailOptions, renderContactNotificationEmailHtml(), renderEmailChangeVerificationHtml() (+8 more)

### Community 19 - "serializePost"
Cohesion: 0.10
Nodes (21): dynamic, GET(), PATCH(), runtime, POST(), runtime, PATCH(), runtime (+13 more)

### Community 20 - "unsubscribe/route.ts"
Cohesion: 0.07
Nodes (39): POST(), POST(), dynamic, runtime, dynamic, GET(), isAllowedDestination(), runtime (+31 more)

### Community 21 - "ProfileSidebar.tsx"
Cohesion: 0.29
Nodes (9): Availability, dateKey(), DAY_LABELS, formatMinutes(), IntroSessionScheduler(), mondayIndex(), MONTH_LABELS, Props (+1 more)

### Community 22 - "marketing/PricingSection.tsx"
Cohesion: 0.60
Nodes (4): PricingCard(), PricingCardProps, PricingSection(), PricingSectionProps

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
Nodes (38): metadata, SpecialistSignUpPage(), EspaciosPage(), AppStatusData, SpecialistOnboardingPage(), specialtyOptions, FaroPage(), GruposPage() (+30 more)

### Community 28 - "sender.ts"
Cohesion: 0.29
Nodes (18): EventRegistrationEmailPayload, buildRawLog(), ContactNotificationPayload, DEFAULT_CONTACT_RECIPIENTS, EmailLogOptions, formatSenderAddress(), isSesConfigured(), logSentEmail() (+10 more)

### Community 29 - "ref_fs"
Cohesion: 0.08
Nodes (16): fs, path, prisma, { PrismaClient }, envPath, envPath, prisma, envPath (+8 more)

### Community 30 - "ContactHero.tsx"
Cohesion: 0.18
Nodes (12): ContactHero(), MOTIVOS, CustomSelect(), CustomSelectProps, SelectOption, parsePhoneNumber(), PhoneInput(), PhoneInputProps (+4 more)

### Community 31 - "inicio/page.tsx"
Cohesion: 0.21
Nodes (7): PlatformContent(), PlatformPage(), MobileMembersCarousel(), MobileMembersCarouselProps, RecentMembersCard(), RecentMembersCardProps, SquareButton

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
Cohesion: 0.12
Nodes (26): CognitoIdentityClaim, CognitoIdTokenClaims, CognitoStartState, CognitoTokenResponse, CognitoUserInfo, exchangeCodeForAccessToken(), fetchCognitoUser(), GET() (+18 more)

### Community 36 - "marketing/app/especialistas/page.tsx"
Cohesion: 0.12
Nodes (14): dynamic, metadata, revalidate, SpecialistsPage(), SpecialistsClosingCta(), SpecialistsControlBanner(), DISCIPLINES, SpecialistsDisciplines() (+6 more)

### Community 37 - "ProfileMembershipCard.tsx"
Cohesion: 0.32
Nodes (6): MONTHS, ProfileMembershipCardProps, getMembershipDisplay(), isMecenas(), MembershipTier, UserSubscriptionContext

### Community 38 - "FaqAccordionList.tsx"
Cohesion: 0.19
Nodes (14): FaqsPage(), metadata, EventsFaq(), CategorizedFaqs(), FaqAccordionList(), FaqAccordionListProps, FaqSection(), HOME_FAQ_IDS (+6 more)

### Community 39 - "platform/components/ui/Button.tsx"
Cohesion: 0.09
Nodes (25): ButtonProps, EmptyProfileButtonProps, ProfileButtonProps, SquareButtonProps, AddCardModalContent(), AddCardModalContentProps, AddPaymentMethodModal(), AddPaymentMethodModalProps (+17 more)

### Community 40 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, paths, resolveJsonModule, skipLibCheck (+3 more)

### Community 41 - "entrevistasyencuentros/page.tsx"
Cohesion: 0.18
Nodes (9): dynamic, EntrevistasYEncuentrosPage(), metadata, revalidate, EventsClosingCta(), EventsFormatsGrid(), EventsHero(), EventsOverviewCard() (+1 more)

### Community 42 - "CompleteProfileView.tsx"
Cohesion: 0.08
Nodes (35): metadata, UnirmePerfilPage(), LocationInput, LocationInputProps, PhotoEditor(), PhotoEditorProps, capitalizeName(), COUNTRY_SYNONYMS (+27 more)

### Community 43 - "Section"
Cohesion: 0.14
Nodes (15): ComparisonColumnProps, ComparisonSection(), ComparisonSectionProps, CTASectionProps, StepItem, StepsSection(), StepsSectionProps, Button (+7 more)

### Community 44 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+6 more)

### Community 45 - "EventRegistrationSection.tsx"
Cohesion: 0.15
Nodes (16): ContactoClient(), cleanTimeString(), EventItem, EventRegistrationSection(), EventRegistrationSectionProps, formatDateTimeFull(), parseCalendarDate(), parseInlineMarkdown() (+8 more)

### Community 46 - "prisma"
Cohesion: 0.15
Nodes (19): DELETE(), extractYoutubeId(), POST(), DELETE(), formatBirthdate(), GET(), parseBirthdate(), PATCH() (+11 more)

### Community 47 - "metadata/route.ts"
Cohesion: 0.27
Nodes (9): decodeHTMLEntities(), dynamic, extractMetaTag(), extractTitleTag(), isPrivateIp(), parseFallbackFromUrl(), POST(), runtime (+1 more)

### Community 48 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:deploy, db:generate, db:migrate, db:push, db:seed:interests, db:studio (+4 more)

### Community 49 - "UpcomingEventsTimeline.tsx"
Cohesion: 0.22
Nodes (12): deduplicateEvents(), dynamic, metadata, ProximasFechasPage(), revalidate, CATEGORY_COLORS, cleanTimeString(), EventItem (+4 more)

### Community 50 - "categories/reset/route.ts"
Cohesion: 0.50
Nodes (4): defaultCategories, POST(), runtime, slugify()

### Community 51 - "FeatureGrid.tsx"
Cohesion: 0.31
Nodes (5): FeatureCard(), FeatureCardProps, FeatureGridProps, Card(), CardProps

### Community 52 - "marketing/package.json"
Cohesion: 0.05
Nodes (42): dependencies, @aws-sdk/client-ses, @aws-sdk/client-sesv2, lucide-react, @marsidev/react-turnstile, next, @prisma/client, react (+34 more)

### Community 53 - "Active Agent Skills"
Cohesion: 0.20
Nodes (9): Active Agent Skills, Architecture & Knowledge, AWS Guidance, Before you conclude, Design & UI Craft, Engineering Philosophy, LUMINUS AI Development Guidelines & Skills, Secret Safety (+1 more)

### Community 54 - "marketing/app/layout.tsx"
Cohesion: 0.23
Nodes (8): jakarta, metadata, RootLayout(), MetaPixel(), META_PIXEL_ID, trackEventInscription(), trackMetaEvent(), Window

### Community 55 - "Luminus Platform Backend"
Cohesion: 0.29
Nodes (6): Auth and database, Cognito login, Luminus Platform Backend, Password recovery emails, Unified S3 Storage, Useful commands

### Community 56 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, @aws-amplify/backend, @aws-amplify/backend-cli, aws-cdk, aws-cdk-lib, constructs, esbuild, tsx (+4 more)

### Community 57 - "cognito-admin.ts"
Cohesion: 0.34
Nodes (12): POST(), runtime, adminConfirmUser(), adminCreateAndConfirmUser(), adminDeleteCognitoUser(), CognitoManagedUser, getCognitoAdminClient(), getCognitoUsername() (+4 more)

### Community 58 - "seed-interests.cjs"
Cohesion: 0.25
Nodes (7): categories, fs, main(), path, prisma, { PrismaClient }, slugify()

### Community 59 - "users/route.ts"
Cohesion: 0.19
Nodes (18): AdminPage(), dynamic, loadAdminSection(), runtime, DELETE(), describeAdminUpdateError(), GET(), PATCH() (+10 more)

### Community 60 - "getCurrentSession"
Cohesion: 0.08
Nodes (27): GET(), runtime, POST(), runtime, POST(), runtime, POST(), runtime (+19 more)

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

### Community 76 - "PostCard.tsx"
Cohesion: 0.15
Nodes (14): PostsTab(), PostsTabProps, CommunityReportModal(), CreatePostCardProps, EditPostModalProps, INITIAL_MOCK_POSTS, LEGACY_MOCK_AUTHORS, LEGACY_MOCK_IDS (+6 more)

### Community 77 - "EditPostModal.tsx"
Cohesion: 0.25
Nodes (13): CreatePostCard(), extractYouTubeId(), htmlToMarkdown(), traverse(), EditPostModal(), extractYouTubeId(), htmlToMarkdown(), traverse() (+5 more)

### Community 78 - "getCurrentSession"
Cohesion: 0.11
Nodes (24): DELETE(), PATCH(), POST(), runtime, slugify(), DELETE(), GET(), PATCH() (+16 more)

### Community 79 - "email/request/route.ts"
Cohesion: 0.13
Nodes (21): POST(), runtime, isValidEmail(), POST(), runtime, PATCH(), runtime, getClientIp() (+13 more)

### Community 80 - "ProfileContent.tsx"
Cohesion: 0.11
Nodes (32): PublicProfileContent(), PublicProfilePage(), ProfilePage(), EmptyProfileButton(), ProfileButton, ProfileAboutSection(), ProfileAboutSectionProps, ProfileCompletionCard() (+24 more)

### Community 81 - "platform/app/layout.tsx"
Cohesion: 0.19
Nodes (9): inter, jakarta, metadata, RootLayout(), viewport, MetaPixel(), META_PIXEL_ID, trackMetaEvent() (+1 more)

### Community 82 - "Modal"
Cohesion: 0.12
Nodes (25): Conversation, fallbackAvatar(), Message, MessagesContent(), loadConversations(), MessagesPage(), CommunityReportModalProps, REPORT_REASONS (+17 more)

### Community 83 - "seed-test-upcoming-events.cjs"
Cohesion: 0.25
Nodes (6): dbUrl, fs, line, lines, prisma, { PrismaClient }

### Community 84 - "cognito-password.ts"
Cohesion: 0.19
Nodes (20): POST(), runtime, CognitoAuthResponse, CognitoError, CognitoIdTokenPayload, cognitoRequest(), CognitoSignUpResponse, confirmSignUp() (+12 more)

### Community 85 - "seed-events.cjs"
Cohesion: 0.33
Nodes (6): fs, generateSlug(), path, prisma, { PrismaClient }, seed()

### Community 86 - "MembershipPaymentView.tsx"
Cohesion: 0.22
Nodes (12): metadata, UnirmePagoPage(), BillingAddressData, BillingAddressInput(), BillingAddressInputProps, ELEMENT_STYLE, isPlaceholderEmail(), MembershipPaymentView() (+4 more)

### Community 87 - "InputField"
Cohesion: 0.17
Nodes (15): IniciarSesionPage(), metadata, ForgotPasswordPage(), metadata, TurnstileWidget(), TurnstileWidgetProps, InputField, InputFieldProps (+7 more)

### Community 93 - "session.ts"
Cohesion: 0.15
Nodes (15): dynamic, GET(), runtime, POST(), runtime, POST(), runtime, base64UrlDecode() (+7 more)

### Community 95 - "Step4Spaces.tsx"
Cohesion: 0.11
Nodes (21): getCountryMaxLength(), PhoneInput(), PhoneInputProps, AreaBlock, PlacesSearchAutocomplete(), SPACE_TYPE_OPTIONS, Step4Clinics, Step4SpacesProps (+13 more)

### Community 96 - "Step2Profile.tsx"
Cohesion: 0.19
Nodes (11): ALL_PLATFORMS, isValidUrl(), Step2ProfileProps, TAG_GROUPS, MODALITY_OPTIONS, Step5CoursesProps, TYPE_OPTIONS, CourseItem (+3 more)

### Community 98 - "platform/next.config.js"
Cohesion: 0.33
Nodes (3): nextConfig, nextConfig, path

### Community 99 - "constants.ts"
Cohesion: 0.24
Nodes (8): getCategoriesAsync(), InterestPill(), InterestPillProps, LEGACY_CATEGORY_MAP, ADMIN_COMMUNITY_CATEGORIES, LUMINUS_CATEGORY_SUBTITLES, SEARCH_DATA, SPACE_SERVICES_BY_CATEGORY

### Community 101 - "createSessionToken"
Cohesion: 0.36
Nodes (7): POST(), runtime, POST(), runtime, base64UrlEncode(), createSessionToken(), setSessionCookie()

### Community 102 - "miembros/page.tsx"
Cohesion: 0.31
Nodes (4): MiembrosContent(), MiembrosPage(), UserCard(), UserCardProps

### Community 103 - "events.ts"
Cohesion: 0.14
Nodes (20): dynamic, GrabacionesListingPage(), metadata, revalidate, dynamic, DynamicEventRegistrationPage(), generateMetadata(), getEventBySlug() (+12 more)

### Community 104 - "backend.ts"
Cohesion: 0.48
Nodes (4): auth, data, Schema, @aws-amplify/backend

### Community 105 - "dedupe-stripe-customers.mjs"
Cohesion: 0.22
Nodes (6): __dirname, envPath, __filename, isExecute, prisma, stripe

### Community 106 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build:marketing, build:platform, dev:marketing, dev:platform, test:platform

### Community 107 - "UpcomingEventsCarousel.tsx"
Cohesion: 0.36
Nodes (7): EventItem, formatSpeakerName(), formatUpcomingDateHeader(), MONTH_NAMES_ES, parseCalendarDate(), UpcomingEventsCarousel(), UpcomingEventsCarouselProps

### Community 108 - "notifications/route.ts"
Cohesion: 0.38
Nodes (6): DELETE(), GET(), PATCH(), runtime, serializeNotification(), getOnboardingQuests()

### Community 109 - "ref_lucide_react"
Cohesion: 0.13
Nodes (6): FAQCategory, FAQItem, TrustSectionProps, aboutContent, CARDS, WelcomeCardItem

### Community 110 - "inscription.ts"
Cohesion: 0.43
Nodes (6): LOGO_IMAGE_URL, EventInscriptionEmailOptions, formatDateSpanish(), parseCalendarDate(), renderEventLiveEmailHtml(), renderEventRegistrationEmailHtml()

### Community 111 - "dependencies"
Cohesion: 0.67
Nodes (3): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Community 113 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, handlebars, postcss

### Community 116 - "runtime/route.ts"
Cohesion: 0.47
Nodes (5): dynamic, GET(), runTest(), runtime, sanitizeError()

### Community 117 - "NotificationPopup.tsx"
Cohesion: 0.40
Nodes (5): NotificationItem(), NotificationItemProps, NotificationPopup(), NotificationPopupProps, OnboardingProgressCardProps

## Knowledge Gaps
- **50 isolated node(s):** `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2`, `@marsidev/react-turnstile`, `@prisma/client` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 796 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getCurrentSession()` connect `getCurrentSession` to `PlatformNavbar.tsx`, `platform/lib/db.ts`, `resumeStorage.ts`, `notifications/route.ts`, `isUuid`, `email/request/route.ts`, `prisma`, `metadata/route.ts`, `categories/reset/route.ts`, `serializePost`, `runtime/route.ts`, `notify-live/route.ts`, `clearSessionCookie`, `users/route.ts`, `getCurrentSession`, `session.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdminUsersClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061009817671809255 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `SpecialistSignUpWizard.tsx` to `AdminUsersClient.tsx`, `PageLoader`, `PlatformNavbar.tsx`, `SettingsContext.tsx`, `configuracion/layout.tsx`, `EditPersonalInfoModal.tsx`, `platform/components/ui/Button.tsx`, `CompleteProfileView.tsx`, `MembershipChoiceView.tsx`, `PostCard.tsx`, `EditPostModal.tsx`, `ProfileContent.tsx`, `Modal`, `MembershipPaymentView.tsx`, `InputField`, `Step4Spaces.tsx`, `Step2Profile.tsx`, `miembros/page.tsx`, `NotificationPopup.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.09743589743589744 - nodes in this community are weakly interconnected._
- **Why does `PageLoader()` connect `PageLoader` to `platform/app/especialistas/page.tsx`, `platform/lib/db.ts`, `miembros/page.tsx`, `configuracion/layout.tsx`, `ProfileContent.tsx`, `Modal`, `MembershipPaymentView.tsx`, `inicio/page.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `PlatformNavbar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11884057971014493 - nodes in this community are weakly interconnected._