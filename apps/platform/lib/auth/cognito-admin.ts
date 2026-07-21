import {
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import type { UserStatus } from "@prisma/client";

type CognitoManagedUser = {
  email: string;
  cognitoSub: string;
  identities?: Array<{
    provider: string;
    providerSubject: string;
  }>;
};

function getCognitoAdminClient() {
  const region = process.env.COGNITO_REGION || "us-east-1";
  const accessKeyId = process.env.COGNITO_ADMIN_ACCESS_KEY_ID;
  const secretAccessKey = process.env.COGNITO_ADMIN_SECRET_ACCESS_KEY;
  const sessionToken = process.env.COGNITO_ADMIN_SESSION_TOKEN;

  return new CognitoIdentityProviderClient({
    region,
    credentials: accessKeyId && secretAccessKey
      ? {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      }
      : undefined,
  });
}

function getUserPoolId() {
  const userPoolId = process.env.COGNITO_USER_POOL_ID?.trim();

  if (!userPoolId) {
    throw new Error("COGNITO_USER_POOL_ID is missing.");
  }

  return userPoolId;
}

function getCognitoUsername(user: CognitoManagedUser) {
  const cognitoIdentity = user.identities?.find((identity) => identity.provider === "cognito");
  return cognitoIdentity?.providerSubject || user.cognitoSub || user.email;
}

function isSystemUser(user: CognitoManagedUser) {
  return user.cognitoSub.startsWith("system:");
}

export async function syncCognitoUserStatus(user: CognitoManagedUser, status: UserStatus) {
  if (isSystemUser(user)) {
    return;
  }

  const client = getCognitoAdminClient();
  const UserPoolId = getUserPoolId();
  const Username = getCognitoUsername(user);

  try {
    if (status === "active") {
      await client.send(new AdminEnableUserCommand({ UserPoolId, Username }));
      return;
    }

    if (status === "disabled") {
      await client.send(new AdminDisableUserCommand({ UserPoolId, Username }));
      return;
    }

    if (status === "deleted") {
      await client.send(new AdminDeleteUserCommand({ UserPoolId, Username }));
    }
  } catch (error) {
    if (status === "deleted" && error instanceof UserNotFoundException) {
      return;
    }

    throw error;
  }
}

export async function updateCognitoUserPassword(user: CognitoManagedUser, password: string) {
  if (isSystemUser(user)) {
    return;
  }

  const hasPoolId = !!process.env.COGNITO_USER_POOL_ID?.trim();
  const hasAdminKeys = !!(process.env.COGNITO_ADMIN_ACCESS_KEY_ID?.trim() && process.env.COGNITO_ADMIN_SECRET_ACCESS_KEY?.trim());

  if (!hasPoolId || (!hasAdminKeys && process.env.NODE_ENV === "development")) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[COGNITO BYPASS]: Cognito admin credentials or Pool ID are missing. Skipping password update in Cognito User Pool for user: ${user.email}`
      );
      return;
    }
  }

  const client = getCognitoAdminClient();
  const UserPoolId = getUserPoolId();
  const Username = getCognitoUsername(user);

  try {
    await client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId,
        Username,
        Password: password,
        Permanent: true,
      })
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[COGNITO BYPASS]: Cognito password update failed in development mode. Skipping. Error:`,
        error
      );
      return;
    }
    throw error;
  }
}

export async function adminConfirmUser(email: string) {
  const client = getCognitoAdminClient();
  const UserPoolId = getUserPoolId();

  try {
    await client.send(
      new AdminConfirmSignUpCommand({
        UserPoolId,
        Username: email,
      })
    );
  } catch (error) {
    console.error("Failed to auto-confirm user in Cognito:", error);
  }
}
