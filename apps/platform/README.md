# Luminus Platform Backend

## Auth and database

The user registration backend uses PostgreSQL through Prisma.

Required local env vars:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public&sslmode=require"
AUTH_SESSION_SECRET="use-a-long-random-secret-with-at-least-32-characters"
S3_AVATAR_BUCKET="luminus-dev-avatars"
S3_AVATAR_REGION="us-east-1"
S3_AVATAR_PUBLIC_BASE_URL="https://luminus-dev-avatars.s3.us-east-1.amazonaws.com"
```

Use `apps/platform/.env.example` as the template.

For local development, create both files if needed:

- `apps/platform/.env.local` for Next.js runtime.
- `apps/platform/.env` for Prisma CLI commands.

Both files must stay out of Git.

## Useful commands

From the repository root:

```bash
npm install
npm run db:generate -w platform
npm run db:migrate -w platform
npm run dev:platform
```

## Avatar uploads

User avatar images are uploaded directly from the browser to S3 with a short-lived signed URL.

Create an S3 bucket for avatars and configure:

- CORS: allow `PUT` from local dev and the Amplify domain.
- Public read, or a CloudFront distribution exposed through `S3_AVATAR_PUBLIC_BASE_URL`.
- IAM permission for the Amplify app/runtime to run `s3:PutObject` on `avatars/*`.

The app stores the resulting public URL in `user_profiles.avatar_url`.
