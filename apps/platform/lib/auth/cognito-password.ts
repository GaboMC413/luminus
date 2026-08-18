import { createHmac } from "crypto";

type CognitoError = Error & {
  code?: string;
  status?: number;
};

type CognitoSignUpResponse = {
  UserSub?: string;
  UserConfirmed?: boolean;
};

type CognitoAuthResponse = {
  AuthenticationResult?: {
    AccessToken?: string;
    IdToken?: string;
    RefreshToken?: string;
  };
  ChallengeName?: string;
};

type CognitoIdTokenPayload = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
};

function getCognitoRegion() {
  if (process.env.COGNITO_REGION) {
    return process.env.COGNITO_REGION;
  }

  const domain = process.env.COGNITO_DOMAIN || "";
  const match = domain.match(/\.auth\.([a-z0-9-]+)\.amazoncognito\.com/i);
  return match?.[1] || "us-east-1";
}

function parseClientSecret(rawSecret?: string) {
  if (!rawSecret) return undefined;
  const trimmed = rawSecret.trim().replace(/^["']|["']$/g, "");
  const upper = trimmed.toUpperCase();
  if (!trimmed || upper === "NONE" || upper === "FALSE" || upper === "CHANGE-ME" || upper === "UNDEFINED" || upper === "NULL") {
    return undefined;
  }
  return trimmed;
}

function getCognitoClientConfig() {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = parseClientSecret(process.env.COGNITO_CLIENT_SECRET);

  if (!clientId) {
    throw makeCognitoError("Cognito password auth is not configured.", "CognitoConfigError", 500);
  }

  return {
    clientId,
    clientSecret,
    endpoint: `https://cognito-idp.${getCognitoRegion()}.amazonaws.com/`,
  };
}

function makeCognitoError(message: string, code?: string, status?: number) {
  const error = new Error(message) as CognitoError;
  error.code = code;
  error.status = status;
  return error;
}

function getSecretHash(username: string, clientId: string, clientSecret?: string) {
  if (!clientSecret) {
    return undefined;
  }

  return createHmac("sha256", clientSecret)
    .update(`${username}${clientId}`)
    .digest("base64");
}

async function cognitoRequest<T>(target: string, payload: Record<string, unknown>) {
  const { endpoint } = getCognitoClientConfig();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as (T & { __type?: string; message?: string }) | null;

  if (!response.ok) {
    const code = data?.__type?.split("#").pop();
    throw makeCognitoError(data?.message || "Cognito request failed.", code, response.status);
  }

  return data as T;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeCognitoIdToken(idToken: string) {
  const [, payload] = idToken.split(".");
  if (!payload) {
    throw makeCognitoError("Cognito ID token is invalid.", "InvalidToken", 401);
  }

  return JSON.parse(decodeBase64Url(payload)) as CognitoIdTokenPayload;
}

export function isCognitoEmailVerified(value: CognitoIdTokenPayload["email_verified"]) {
  return value === true || value === "true";
}

export async function signUpWithCognito(email: string, password: string) {
  const { clientId, clientSecret } = getCognitoClientConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const secretHash = getSecretHash(normalizedEmail, clientId, clientSecret);

  const response = await cognitoRequest<CognitoSignUpResponse>("SignUp", {
    ClientId: clientId,
    Username: normalizedEmail,
    Password: password,
    ...(secretHash ? { SecretHash: secretHash } : {}),
    UserAttributes: [
      { Name: "email", Value: normalizedEmail },
    ],
  });

  if (!response.UserSub) {
    throw makeCognitoError("Cognito did not return a user subject.", "MissingUserSub", 500);
  }

  return {
    userSub: response.UserSub,
    userConfirmed: response.UserConfirmed ?? false,
  };
}

async function initiatePasswordAuth(username: string, password: string) {
  const { clientId, clientSecret } = getCognitoClientConfig();
  const secretHash = getSecretHash(username, clientId, clientSecret);

  return cognitoRequest<CognitoAuthResponse>("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      ...(secretHash ? { SECRET_HASH: secretHash } : {}),
    },
  });
}

function shouldRetryWithCognitoUsername(error: unknown) {
  const code = (error as CognitoError).code;
  return code === "NotAuthorizedException" || code === "UserNotFoundException";
}

export async function signInWithCognito(email: string, password: string, cognitoUsername?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackUsername = cognitoUsername?.trim();
  let response: CognitoAuthResponse;

  try {
    response = await initiatePasswordAuth(normalizedEmail, password);
  } catch (error) {
    if (!fallbackUsername || fallbackUsername === normalizedEmail || !shouldRetryWithCognitoUsername(error)) {
      throw error;
    }

    response = await initiatePasswordAuth(fallbackUsername, password);
  }

  if (response.ChallengeName) {
    throw makeCognitoError("Cognito requires an additional authentication challenge.", response.ChallengeName, 401);
  }

  const idToken = response.AuthenticationResult?.IdToken;
  if (!idToken) {
    throw makeCognitoError("Cognito did not return an ID token.", "MissingIdToken", 401);
  }

  const profile = decodeCognitoIdToken(idToken);
  if (!profile.sub || !profile.email) {
    throw makeCognitoError("Cognito ID token is missing required profile fields.", "InvalidToken", 401);
  }

  return {
    idToken,
    profile: {
      sub: profile.sub,
      email: profile.email.trim().toLowerCase(),
      emailVerified: isCognitoEmailVerified(profile.email_verified),
      givenName: profile.given_name || "",
      familyName: profile.family_name || "",
      name: profile.name || "",
      picture: profile.picture || "",
    },
  };
}

export function getCognitoErrorMessage(error: unknown, fallback: string) {
  const cognitoError = error as CognitoError;

  if (cognitoError.code === "UserNotConfirmedException") {
    return "Tu cuenta necesita confirmar el correo antes de ingresar.";
  }

  if (cognitoError.code === "NotAuthorizedException" || cognitoError.code === "UserNotFoundException") {
    return "Correo o contrasena incorrectos.";
  }

  if (cognitoError.code === "UsernameExistsException") {
    return "Ya existe una cuenta registrada con este correo.";
  }

  if (cognitoError.code === "InvalidPasswordException") {
    return "La contrasena no cumple los requisitos de seguridad.";
  }

  if (cognitoError.code === "CognitoConfigError") {
    return "Cognito todavia no esta configurado para este entorno.";
  }

  if (
    cognitoError.code === "InvalidParameterException" &&
    (cognitoError.message?.includes("USER_PASSWORD_AUTH") || cognitoError.message?.includes("Auth flow"))
  ) {
    return "Cognito necesita habilitar USER_PASSWORD_AUTH para este cliente.";
  }

  if (cognitoError.code === "InvalidParameterException") {
    console.error("[Cognito InvalidParameterException]:", cognitoError.message);
    return "Los datos ingresados no son validos.";
  }

  return fallback;
}

export function getCognitoErrorStatus(error: unknown, fallbackStatus = 500) {
  const code = (error as CognitoError).code;

  if (code === "CognitoConfigError") {
    return 500;
  }

  if (code === "NotAuthorizedException" || code === "UserNotFoundException") {
    return 401;
  }

  if (code === "UserNotConfirmedException") {
    return 403;
  }

  if (code === "InvalidPasswordException" || code === "InvalidParameterException") {
    return 400;
  }

  if (code === "UsernameExistsException") {
    return 409;
  }

  return fallbackStatus;
}

export async function confirmSignUp(email: string, code: string) {
  const { clientId, clientSecret } = getCognitoClientConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const secretHash = getSecretHash(normalizedEmail, clientId, clientSecret);

  await cognitoRequest("ConfirmSignUp", {
    ClientId: clientId,
    Username: normalizedEmail,
    ConfirmationCode: code.trim(),
    ...(secretHash ? { SecretHash: secretHash } : {}),
  });
}

export async function resendConfirmationCode(email: string) {
  const { clientId, clientSecret } = getCognitoClientConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const secretHash = getSecretHash(normalizedEmail, clientId, clientSecret);

  await cognitoRequest("ResendConfirmationCode", {
    ClientId: clientId,
    Username: normalizedEmail,
    ...(secretHash ? { SecretHash: secretHash } : {}),
  });
}
