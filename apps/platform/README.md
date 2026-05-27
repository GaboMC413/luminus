# Luminus Platform Backend

## Auth and database

The user registration backend uses PostgreSQL through Prisma.

Required local env vars:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public&sslmode=require"
AUTH_SESSION_SECRET="use-a-long-random-secret-with-at-least-32-characters"
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
