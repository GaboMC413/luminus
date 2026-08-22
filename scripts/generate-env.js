const fs = require("fs");
const path = require("path");

const targetArg = process.argv[2] || ".env.production";
const targetPath = path.resolve(process.cwd(), targetArg);

// Desempacar process.env.secrets inyectado por AWS Amplify SSM
if (process.env.secrets) {
  try {
    const secretsObj = JSON.parse(process.env.secrets);
    Object.assign(process.env, secretsObj);
    console.log("[generate-env] Successfully unpacked process.env.secrets into process.env");
  } catch (e) {
    console.warn("[generate-env] Could not parse process.env.secrets JSON:", e);
  }
}

const keys = [
  "DATABASE_URL",
  "AUTH_SESSION_SECRET",
  "AUTH_BASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "COGNITO_DOMAIN",
  "COGNITO_REGION",
  "COGNITO_CLIENT_ID",
  "COGNITO_CLIENT_SECRET",
  "COGNITO_USER_POOL_ID",
  "COGNITO_ADMIN_ACCESS_KEY_ID",
  "COGNITO_ADMIN_SECRET_ACCESS_KEY",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "S3_BUCKET",
  "S3_REGION",
  "S3_PUBLIC_BASE_URL",
  "SES_REGION",
  "SES_FROM_EMAIL",
  "EVENT_FROM_EMAIL",
  "SES_ACCESS_KEY_ID",
  "SES_SECRET_ACCESS_KEY",
  "ENABLE_RUNTIME_DEBUG",
  "SKIP_EMAIL_VERIFICATION",
];

const lines = keys
  .filter((key) => process.env[key] !== undefined && process.env[key] !== "")
  .map((key) => `${key}=${process.env[key]}`);

fs.writeFileSync(targetPath, lines.join("\n") + "\n", "utf8");

console.log(`[generate-env] Successfully wrote ${lines.length} env vars to ${targetPath}`);
