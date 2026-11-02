# Graph Report - luminus  (2026-10-28)

## Corpus Check
- 426 files · ~2,715,789 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: (none) 5, .css 4, .ico 3)

## Summary
- 1932 nodes · 4768 edges · 115 communities (93 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6f981b0a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- register-v2/route.ts
- AdminUsersClient.tsx
- PageLoader
- PlatformNavbar.tsx
- "users"
- platform/lib/db.ts
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
- events.ts
- renderEmailLayout
- serializePost
- marketing/lib/db.ts
- PostCard.tsx
- marketing/PricingSection.tsx
- README.md
- session.ts
- compilerOptions
- compilerOptions
- SpecialistSignUpWizard.tsx
- public-profile/page.tsx
- ref_fs
- ContactHero.tsx
- callback/route.ts
- package.json
- dependencies
- marketing/app/page.tsx
- InterestPill.tsx
- marketing/app/especialistas/page.tsx
- Step4Spaces.tsx
- FaqAccordionList.tsx
- cognito-admin.ts
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
- SelectInput
- Luminus Platform Backend
- MobileMembersCarousel.tsx
- EditPromptsModal.tsx
- SignUpView.tsx
- runtime/route.ts
- stripe.ts
- notificaciones/page.tsx
- platform/next.config.js
- local-unsubscribe-helper.ts
- EditPostModal.tsx
- Reglas del Proyecto LUMINUS (AGENTS.md)
- @prisma/client
- CODE_OF_CONDUCT.md
- contacts.sql
- amplify/package.json
- EditPersonalInfoModal.tsx
- comunidad/page.tsx
- InputField
- email/request/route.ts
- seed-interests.cjs
- platform/app/layout.tsx
- ref_next
- seed-test-upcoming-events.cjs
- cognito-password.ts
- seed-events.cjs
- MembershipPaymentView.tsx
- AccountCreationView.tsx
- audit-emails.cjs
- check-admin-user.cjs
- fix-and-normalize-categories.cjs
- fix-event-dates.cjs
- make-gabriel-admin.cjs
- events.ts
- GEMINI.md
- EventsTab.tsx
- unsubscribe/route.ts
- configuracion/page.tsx
- posts/[id]/route.ts
- CategoriesTab
- createSessionToken
- IntroSessionScheduler.tsx
- sweep-orphan-s3-files.cjs
- [slug]/page.tsx
- start/route.ts
- notifications/route.ts
- ContactoClient.tsx
- categories/reset/route.ts
- platform/app/especialistas/page.tsx
- FAQClient.tsx
- audit-categories.cjs
- clean-false-events.cjs
- make-specialist.cjs
- SearchesTab.tsx

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
- `ContactoClient()` --calls--> `TurnstileWidget()`  [EXTRACTED]
  apps/marketing/app/contacto/ContactoClient.tsx → apps/marketing/components/TurnstileWidget.tsx
- `ContactoPage()` --calls--> `ContactHero()`  [EXTRACTED]
  apps/marketing/app/contacto/page.tsx → apps/marketing/components/contact/ContactHero.tsx
- `EmpresasAliadasPage()` --calls--> `PricingSection()`  [EXTRACTED]
  apps/marketing/app/empresas-aliadas/page.tsx → apps/marketing/components/marketing/PricingSection.tsx

## Import Cycles
- None detected.

## Communities (115 total, 22 thin omitted)

### Community 0 - "register-v2/route.ts"
Cohesion: 0.22
Nodes (15): POST(), runtime, GET(), runtime, POST(), runtime, POST(), runtime (+7 more)

### Community 1 - "AdminUsersClient.tsx"
Cohesion: 0.18
Nodes (19): AdminHeader(), AdminSidebar(), AdminSidebarProps, CategoriesTabProps, ContactTab(), ContactTabProps, EventsTabProps, DAY_NAMES (+11 more)

### Community 2 - "PageLoader"
Cohesion: 0.09
Nodes (23): Loading(), MiembrosContent(), MiembrosPage(), Loading(), Loading(), Loading(), Loading(), Loading() (+15 more)

### Community 3 - "PlatformNavbar.tsx"
Cohesion: 0.20
Nodes (18): CommunityLayout(), EspaciosLayout(), EspecialistasLayoutClient(), EspecialistasLayout(), FaroLayout(), GruposLayout(), MapLayout(), MessagesLayout() (+10 more)

### Community 4 - ""users""
Cohesion: 0.06
Nodes (42): "interest_categories", interest_categories_slug_key, "interests", interests_slug_key, "user_interests", "user_profiles", "users", users_cognito_sub_key (+34 more)

### Community 5 - "platform/lib/db.ts"
Cohesion: 0.06
Nodes (48): DELETE(), PATCH(), POST(), runtime, slugify(), DELETE(), GET(), PATCH() (+40 more)

### Community 6 - "fetch_videos.js"
Cohesion: 0.09
Nodes (26): autoCategorize(), decodeHtmlEntities(), delay(), extractVideosFromData(), fetchUrl(), fs, guessSpeaker(), https (+18 more)

### Community 7 - "users/route.ts"
Cohesion: 0.17
Nodes (19): AdminPage(), dynamic, loadAdminSection(), runtime, DELETE(), describeAdminUpdateError(), GET(), PATCH() (+11 more)

### Community 8 - "configuracion/page.tsx"
Cohesion: 0.11
Nodes (21): LocationInput, LocationInputProps, EditableField(), EditableFieldProps, EmailSection(), EmailSectionProps, PasswordSection(), PasswordSectionProps (+13 more)

### Community 9 - "empresas-aliadas/page.tsx"
Cohesion: 0.16
Nodes (22): EmpresasAliadasPage(), metadata, metadata, SobreNosotrosPage(), PlatformSection(), PlatformSectionProps, ProblemSection(), ProblemSectionProps (+14 more)

### Community 10 - "platform/package.json"
Cohesion: 0.07
Nodes (27): autoprefixer, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner, lucide-react, @marsidev/react-turnstile, next (+19 more)

### Community 11 - "Footer"
Cohesion: 0.15
Nodes (19): ContactoPage(), metadata, DesuscribirPage(), UnsubscribeContent(), CondicionesEspecialistasPage(), metadata, CookiesPage(), metadata (+11 more)

### Community 12 - "mensajes/page.tsx"
Cohesion: 0.17
Nodes (15): fallbackAvatar(), MessagesContent(), loadConversations(), MessagesPage(), ChatPopup(), ChatPopupProps, Conversation, Message (+7 more)

### Community 13 - "Button"
Cohesion: 0.29
Nodes (6): EspaciosPage(), FaroPage(), GruposPage(), Button(), ApplicationStatusView(), ApplicationStatusViewProps

### Community 14 - "isUuid"
Cohesion: 0.08
Nodes (39): dynamic, POST(), runtime, GET(), MOCK_PROFILES, runtime, POST(), runtime (+31 more)

### Community 15 - "ref_react"
Cohesion: 0.12
Nodes (6): BenefitItem, BenefitsGridProps, TrustSectionProps, bgClasses, SectionProps, WelcomeBannerProps

### Community 16 - "resumeStorage.ts"
Cohesion: 0.09
Nodes (30): dynamic, GET(), runtime, ALLOWED_CONTENT_TYPES, extensionForContentType(), POST(), runtime, dynamic (+22 more)

### Community 17 - "events.ts"
Cohesion: 0.13
Nodes (25): EventCard(), EventCardProps, EventItem, formatDate(), formatUpcomingDateHeader(), getYoutubeId(), isSpeakerNameValid(), MONTH_NAMES_ES (+17 more)

### Community 18 - "renderEmailLayout"
Cohesion: 0.12
Nodes (22): ContactEmailPreviewPage(), EmailChangePreviewPage(), EmailPreviewPage(), PasswordResetEmailPreviewPage(), WelcomeEmailPreviewPage(), ContactNotificationEmailOptions, renderContactNotificationEmailHtml(), renderEmailChangeVerificationHtml() (+14 more)

### Community 19 - "serializePost"
Cohesion: 0.14
Nodes (16): dynamic, GET(), PATCH(), runtime, POST(), runtime, PATCH(), runtime (+8 more)

### Community 20 - "marketing/lib/db.ts"
Cohesion: 0.12
Nodes (16): POST(), POST(), dynamic, runtime, dynamic, runtime, TRANSPARENT_GIF, dynamic (+8 more)

### Community 21 - "PostCard.tsx"
Cohesion: 0.11
Nodes (21): PostsTabProps, CommunityReportModal(), CommunityReportModalProps, REPORT_REASONS, CreatePostCardProps, EditPostModalProps, INITIAL_MOCK_POSTS, LEGACY_MOCK_AUTHORS (+13 more)

### Community 22 - "marketing/PricingSection.tsx"
Cohesion: 0.60
Nodes (4): PricingCard(), PricingCardProps, PricingSection(), PricingSectionProps

### Community 23 - "README.md"
Cohesion: 0.10
Nodes (18): Code of Conduct, Contributing Guidelines, Contributing via Pull Requests, Finding contributions to work on, Licensing, Reporting Bugs/Feature Requests, Security issue notifications, 1. Database-Connected Mode (Default & Dev Connection) (+10 more)

### Community 24 - "session.ts"
Cohesion: 0.17
Nodes (15): DELETE(), runtime, GET(), getCognitoDomain(), POST(), runtime, POST(), runtime (+7 more)

### Community 25 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 26 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 27 - "SpecialistSignUpWizard.tsx"
Cohesion: 0.07
Nodes (41): metadata, SpecialistSignUpPage(), AppStatusData, SpecialistOnboardingPage(), specialtyOptions, GoogleIcon(), SpecialistSignUpWizard(), specialtyOptions (+33 more)

### Community 28 - "public-profile/page.tsx"
Cohesion: 0.15
Nodes (25): PublicProfileContent(), PublicProfilePage(), EmptyProfileButton(), ProfileButton, ProfileAboutSection(), ProfileAboutSectionProps, ProfileCompletionCard(), Profile (+17 more)

### Community 29 - "ref_fs"
Cohesion: 0.08
Nodes (16): fs, path, prisma, { PrismaClient }, envPath, envPath, prisma, envPath (+8 more)

### Community 30 - "ContactHero.tsx"
Cohesion: 0.18
Nodes (12): ContactHero(), MOTIVOS, CustomSelect(), CustomSelectProps, SelectOption, parsePhoneNumber(), PhoneInput(), PhoneInputProps (+4 more)

### Community 31 - "callback/route.ts"
Cohesion: 0.19
Nodes (17): CognitoIdentityClaim, CognitoIdTokenClaims, CognitoStartState, CognitoTokenResponse, CognitoUserInfo, exchangeCodeForAccessToken(), fetchCognitoUser(), GET() (+9 more)

### Community 32 - "package.json"
Cohesion: 0.05
Nodes (41): auth, data, Schema, dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, devDependencies, @aws-amplify/backend (+33 more)

### Community 33 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, aws-amplify, @aws-amplify/ui-react, @aws-sdk/client-cognito-identity-provider, @aws-sdk/client-s3, @aws-sdk/client-ses, @aws-sdk/client-sesv2, @aws-sdk/s3-request-presigner (+11 more)

### Community 34 - "marketing/app/page.tsx"
Cohesion: 0.12
Nodes (17): dynamic, Home(), metadata, revalidate, CATEGORIES, CategoriesGrid(), ContactBanner(), ConversationSection() (+9 more)

### Community 35 - "InterestPill.tsx"
Cohesion: 0.50
Nodes (4): getCategoriesAsync(), InterestPill(), InterestPillProps, LEGACY_CATEGORY_MAP

### Community 36 - "marketing/app/especialistas/page.tsx"
Cohesion: 0.12
Nodes (14): dynamic, metadata, revalidate, SpecialistsPage(), SpecialistsClosingCta(), SpecialistsControlBanner(), DISCIPLINES, SpecialistsDisciplines() (+6 more)

### Community 37 - "Step4Spaces.tsx"
Cohesion: 0.18
Nodes (14): getCountryMaxLength(), PhoneInput(), PhoneInputProps, AreaBlock, AreaServicesPills(), PlacesSearchAutocomplete(), SPACE_TYPE_OPTIONS, Step4Clinics (+6 more)

### Community 38 - "FaqAccordionList.tsx"
Cohesion: 0.24
Nodes (11): EventsFaq(), FaqAccordionList(), FaqAccordionListProps, FaqSection(), HOME_FAQ_IDS, SpecialistsFaq(), FAQ_CATEGORIES, FaqArea (+3 more)

### Community 39 - "cognito-admin.ts"
Cohesion: 0.29
Nodes (13): PATCH(), runtime, adminConfirmUser(), adminCreateAndConfirmUser(), adminDeleteCognitoUser(), CognitoManagedUser, getCognitoAdminClient(), getCognitoUsername() (+5 more)

### Community 40 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, paths, resolveJsonModule, skipLibCheck (+3 more)

### Community 41 - "entrevistasyencuentros/page.tsx"
Cohesion: 0.18
Nodes (9): dynamic, EntrevistasYEncuentrosPage(), metadata, revalidate, EventsClosingCta(), EventsFormatsGrid(), EventsHero(), EventsOverviewCard() (+1 more)

### Community 42 - "PersonalData.tsx"
Cohesion: 0.10
Nodes (26): metadata, UnirmePerfilPage(), capitalizeName(), COUNTRY_SYNONYMS, currentYearNum, DAYS, MONTHS, NEUTRAL_COUNTRY (+18 more)

### Community 43 - "Section"
Cohesion: 0.15
Nodes (14): ComparisonColumnProps, ComparisonSection(), ComparisonSectionProps, StepItem, StepsSection(), StepsSectionProps, Button, ButtonProps (+6 more)

### Community 44 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+5 more)

### Community 45 - "EventRegistrationSection.tsx"
Cohesion: 0.11
Nodes (21): jakarta, metadata, RootLayout(), MetaPixel(), cleanTimeString(), EventItem, EventRegistrationSection(), EventRegistrationSectionProps (+13 more)

### Community 46 - "prisma"
Cohesion: 0.08
Nodes (24): runtime, dynamic, runtime, parseBirthdate(), POST(), runtime, slugify(), formatBirthdate() (+16 more)

### Community 47 - "metadata/route.ts"
Cohesion: 0.43
Nodes (7): decodeHTMLEntities(), dynamic, extractMetaTag(), extractTitleTag(), parseFallbackFromUrl(), POST(), runtime

### Community 48 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:deploy, db:generate, db:migrate, db:push, db:seed:interests, db:studio (+4 more)

### Community 49 - "UpcomingEventsTimeline.tsx"
Cohesion: 0.22
Nodes (12): deduplicateEvents(), dynamic, metadata, ProximasFechasPage(), revalidate, CATEGORY_COLORS, cleanTimeString(), EventItem (+4 more)

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

### Community 54 - "SelectInput"
Cohesion: 0.17
Nodes (16): EmailLogsTabProps, templatesData, LogsTab(), LogsTabProps, AdminEmailLog, AdminLog, fieldValue(), getActionBadge() (+8 more)

### Community 55 - "Luminus Platform Backend"
Cohesion: 0.29
Nodes (6): Auth and database, Avatar uploads, Cognito login, Luminus Platform Backend, Password recovery emails, Useful commands

### Community 56 - "MobileMembersCarousel.tsx"
Cohesion: 0.47
Nodes (4): MobileMembersCarousel(), MobileMembersCarouselProps, UserCard(), UserCardProps

### Community 57 - "EditPromptsModal.tsx"
Cohesion: 0.26
Nodes (9): ButtonProps, EmptyProfileButtonProps, ProfileButtonProps, SquareButtonProps, ProfileCompletionCardProps, ALL_PROMPTS, Prompt, PromptsDisplay() (+1 more)

### Community 58 - "SignUpView.tsx"
Cohesion: 0.18
Nodes (14): ForgotPasswordPage(), metadata, TurnstileWidget(), TurnstileWidgetProps, ForgotPasswordView(), formatName(), GoogleIcon(), SignUpView() (+6 more)

### Community 59 - "runtime/route.ts"
Cohesion: 0.47
Nodes (5): dynamic, GET(), runTest(), runtime, sanitizeError()

### Community 60 - "stripe.ts"
Cohesion: 0.40
Nodes (4): CreateSubscriptionResult, isStripeConfigured, stripe, stripe

### Community 61 - "notificaciones/page.tsx"
Cohesion: 0.19
Nodes (13): FILTERS, Notification, NotificationsContent(), NotificationsPage(), NotificationItem(), NotificationItemProps, NotificationPopup(), NotificationPopupProps (+5 more)

### Community 62 - "platform/next.config.js"
Cohesion: 0.33
Nodes (3): nextConfig, nextConfig, path

### Community 63 - "local-unsubscribe-helper.ts"
Cohesion: 0.34
Nodes (13): createSentEmailRecord(), filterUnsubscribedEmails(), generateUnsubscribeToken(), generateUnsubscribeUrls(), getBaseUrl(), injectAnalyticsTracking(), normalizeEmail(), prepareCampaignEmail() (+5 more)

### Community 64 - "EditPostModal.tsx"
Cohesion: 0.15
Nodes (20): CreatePostCard(), extractYouTubeId(), htmlToMarkdown(), traverse(), EditPostModal(), extractYouTubeId(), htmlToMarkdown(), traverse() (+12 more)

### Community 66 - "@prisma/client"
Cohesion: 0.25
Nodes (4): prisma, { PrismaClient }, { PrismaClient }, @prisma/client

### Community 68 - "contacts.sql"
Cohesion: 0.83
Nodes (3): idx_contact_messages_created_at, idx_contact_messages_email, public.contact_messages

### Community 76 - "EditPersonalInfoModal.tsx"
Cohesion: 0.25
Nodes (8): currentYearNum, DAYS, EditPersonalInfoModal(), EditPersonalInfoModalProps, isValidBirthdate(), MONTHS, ProfileData, YEARS

### Community 77 - "comunidad/page.tsx"
Cohesion: 0.16
Nodes (12): PlatformContent(), PlatformPage(), RecentMembersCard(), RecentMembersCardProps, EventItem, formatSpeakerName(), formatUpcomingDateHeader(), MONTH_NAMES_ES (+4 more)

### Community 78 - "InputField"
Cohesion: 0.20
Nodes (15): AdminUsersClient(), AdminCard(), ChatsTab(), ChatsTabProps, EmailLogsTab(), PostsTab(), SearchesTab(), SpecialistsTab() (+7 more)

### Community 79 - "email/request/route.ts"
Cohesion: 0.21
Nodes (15): isValidEmail(), POST(), runtime, POST(), runtime, POST(), runtime, POST() (+7 more)

### Community 80 - "seed-interests.cjs"
Cohesion: 0.25
Nodes (7): categories, fs, main(), path, prisma, { PrismaClient }, slugify()

### Community 81 - "platform/app/layout.tsx"
Cohesion: 0.24
Nodes (7): inter, jakarta, metadata, RootLayout(), viewport, MetaPixel(), META_PIXEL_ID

### Community 82 - "ref_next"
Cohesion: 0.09
Nodes (9): runtime, IniciarSesionPage(), metadata, MembresiaPage(), metadata, metadata, UnirmePage(), MembershipChoiceView() (+1 more)

### Community 83 - "seed-test-upcoming-events.cjs"
Cohesion: 0.25
Nodes (6): dbUrl, fs, line, lines, prisma, { PrismaClient }

### Community 84 - "cognito-password.ts"
Cohesion: 0.18
Nodes (21): POST(), runtime, CognitoAuthResponse, CognitoError, CognitoIdTokenPayload, cognitoRequest(), CognitoSignUpResponse, confirmSignUp() (+13 more)

### Community 85 - "seed-events.cjs"
Cohesion: 0.33
Nodes (6): fs, generateSlug(), path, prisma, { PrismaClient }, seed()

### Community 86 - "MembershipPaymentView.tsx"
Cohesion: 0.27
Nodes (7): metadata, UnirmePagoPage(), BillingAddressData, BillingAddressInput(), BillingAddressInputProps, MembershipPaymentView(), use-places-autocomplete

### Community 87 - "AccountCreationView.tsx"
Cohesion: 0.31
Nodes (7): metadata, UnirmeCrearCuentaPage(), AccountCreationView(), FACEBOOK_APP_ID, loadFacebookSDK(), loginWithFacebook(), Window

### Community 93 - "events.ts"
Cohesion: 0.17
Nodes (14): dynamic, runtime, dynamic, GrabacionesListingPage(), metadata, revalidate, CATEGORY_META, CategoryMeta (+6 more)

### Community 95 - "EventsTab.tsx"
Cohesion: 0.19
Nodes (15): AdminBadge(), AdminBadgeProps, AdminCardProps, AdminDetailRow(), AdminDetailRowProps, AdminSectionHeaderProps, EVENT_CATEGORIES, EventsTab() (+7 more)

### Community 96 - "unsubscribe/route.ts"
Cohesion: 0.30
Nodes (13): dynamic, GET(), POST(), processResubscribe(), processUnsubscribe(), runtime, generateUnsubscribeHeaders(), generateUnsubscribeToken() (+5 more)

### Community 97 - "configuracion/page.tsx"
Cohesion: 0.21
Nodes (9): SettingsContent(), SettingsPage(), CONFETTI_COLORS, ConfettiExplosion(), ConfettiParticle, SuccessModal(), SuccessModalProps, MembershipSection() (+1 more)

### Community 98 - "posts/[id]/route.ts"
Cohesion: 0.23
Nodes (10): DELETE(), extractYoutubeId(), POST(), DELETE(), PATCH(), runtime, DELETE(), deleteS3FileByUrl() (+2 more)

### Community 100 - "createSessionToken"
Cohesion: 0.33
Nodes (8): POST(), runtime, POST(), POST(), runtime, base64UrlEncode(), createSessionToken(), setSessionCookie()

### Community 101 - "IntroSessionScheduler.tsx"
Cohesion: 0.29
Nodes (9): Availability, dateKey(), DAY_LABELS, formatMinutes(), IntroSessionScheduler(), mondayIndex(), MONTH_LABELS, Props (+1 more)

### Community 102 - "sweep-orphan-s3-files.cjs"
Cohesion: 0.28
Nodes (7): { Client }, DRY_RUN, getActiveReferencedKeys(), listAllS3Objects(), run(), s3, { S3Client, ListObjectsV2Command, DeleteObjectsCommand }

### Community 103 - "[slug]/page.tsx"
Cohesion: 0.36
Nodes (7): dynamic, DynamicEventRegistrationPage(), generateMetadata(), getEventBySlug(), getImageMimeType(), PageProps, revalidate

### Community 104 - "start/route.ts"
Cohesion: 0.38
Nodes (6): COGNITO_SCOPES, CognitoStartState, GET(), getCognitoDomain(), getPublicOrigin(), runtime

### Community 105 - "notifications/route.ts"
Cohesion: 0.38
Nodes (6): DELETE(), GET(), PATCH(), runtime, serializeNotification(), getOnboardingQuests()

### Community 106 - "ContactoClient.tsx"
Cohesion: 0.47
Nodes (3): ContactoClient(), TurnstileWidget(), TurnstileWidgetProps

### Community 107 - "categories/reset/route.ts"
Cohesion: 0.50
Nodes (4): defaultCategories, POST(), runtime, slugify()

### Community 108 - "platform/app/especialistas/page.tsx"
Cohesion: 0.50
Nodes (4): ApplicationStatus, EspecialistasPage(), Specialist, SpecialistCard()

## Knowledge Gaps
- **50 isolated node(s):** `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2`, `@marsidev/react-turnstile`, `lucide-react` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 746 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `@prisma/client` to `platform/lib/db.ts`, `fetch_videos.js`, `users/route.ts`, `platform/package.json`, `marketing/lib/db.ts`, `ref_fs`, `cognito-admin.ts`, `prisma`, `local-unsubscribe-helper.ts`, `seed-interests.cjs`, `seed-test-upcoming-events.cjs`, `seed-events.cjs`, `audit-emails.cjs`, `check-admin-user.cjs`, `fix-and-normalize-categories.cjs`, `fix-event-dates.cjs`, `make-gabriel-admin.cjs`, `audit-categories.cjs`, `clean-false-events.cjs`, `make-specialist.cjs`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `RFC-8058`, `@aws-sdk/client-ses`, `@aws-sdk/client-sesv2` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PageLoader` be split into smaller, more focused modules?**
  _Cohesion score 0.08943089430894309 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `EditPostModal.tsx`, `AdminUsersClient.tsx`, `PageLoader`, `configuracion/page.tsx`, `Step4Spaces.tsx`, `PersonalData.tsx`, `EditPersonalInfoModal.tsx`, `InputField`, `ref_next`, `PostCard.tsx`, `SelectInput`, `AccountCreationView.tsx`, `MembershipPaymentView.tsx`, `EditPromptsModal.tsx`, `SignUpView.tsx`, `SpecialistSignUpWizard.tsx`, `public-profile/page.tsx`, `EventsTab.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `"users"` be split into smaller, more focused modules?**
  _Cohesion score 0.0641025641025641 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `platform/package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `platform/lib/db.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06246799795186892 - nodes in this community are weakly interconnected._