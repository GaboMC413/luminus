## AWS Amplify Next.js (App Router) Starter Template

This repository provides a starter template for creating applications using Next.js (App Router) and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational Next.js application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws) of our documentation.

## Local development

To run the application locally, you can choose either the default **Database-Connected** mode (using the real dev database) or the **Database-Less (Mock)** mode (fallback behind an env flag).

### 1. Database-Connected Mode (Default & Dev Connection)
To connect your local Next.js platform directly to the dev environment database:
1. Copy the template file `apps/platform/.env.example` to `apps/platform/.env.local`:
   ```bash
   cp apps/platform/.env.example apps/platform/.env.local
   ```
2. Open `apps/platform/.env.local` and configure:
   - **`DATABASE_URL`**: Set this to your dev environment PostgreSQL database connection string (e.g., the dev RDS URL).
   - **`AUTH_SESSION_SECRET`**: Set this to the dev environment session signing secret.
3. Start the dev server:
   ```bash
   npm run dev:platform
   ```
*Note: In this mode, user registration (sign up) dynamically inserts new records into the dev PostgreSQL database (`User` and `UserProfile` schemas). Login requests, onboarding forms, the Community feed, and public profile views fetch real test data from the dev database.*

### 2. Database-Less (Mock) Mode (Explicit Bypass)
If you want to run the frontend without a database connection:
1. Set the following flag in `apps/platform/.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```
2. The application will fall back to local mock credentials (e.g. Nancy Núñez) during login, registration, and onboarding.
3. The **Comunidad** screen will display static cards mapped from `MOCK_USERS` defined in [constants.ts](file:///c:/Users/gabri/OneDrive/Escritorio/Diseño%20PC/Luminus/Web%20-%20App/luminus/apps/platform/utils/constants.ts).

### 3. Error Diagnostics (Development Safety)
If you run the app locally without configuring `DATABASE_URL` in `.env.local` and without setting `NEXT_PUBLIC_USE_MOCK_DATA=true`, the `/comunidad` page will show a diagnostic error page and api requests will fail with a `500` status. This prevents silent fallbacks to mock data.

### 4. Avatar Upload Mocking (Local Safe Setup)
Because local machines do not contain S3 environment credentials by default, avatar uploads will fail. To mock avatar uploads locally:
1. Set the following flag in `apps/platform/.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_AVATAR_UPLOAD=true
   ```
2. This intercepts the upload call in `uploadAvatar.ts` and returns a local preview blob URL (`URL.createObjectURL(file)`) instead of sending a POST request to S3.

**Security Reminder**: Do not commit your `.env.local` file (it is ignored by Git by default).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.