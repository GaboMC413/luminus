import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { withServerCache, invalidateServerCacheTag } from "@/lib/serverCache";

export const SESSION_COOKIE_NAME = "luminus_session";

export function invalidateUserSessionCache(userId: string) {
  invalidateServerCacheTag(`user-session:${userId}`);
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== "production") {
      return "local-development-fallback-session-secret-32-chars-long";
    }
    throw new Error("AUTH_SESSION_SECRET must be at least 32 characters long.");
  }

  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signReactivation(value: string) {
  return createHmac("sha256", getSessionSecret()).update(`reactivate:${value}`).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(12).toString("hex"),
  };
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = sign(encodedBody);

  return `${encodedBody}.${signature}`;
}

export function createReactivationToken(payload: Omit<SessionPayload, "exp">, ttlSeconds = 5 * 60) {
  const body = {
    ...payload,
    purpose: "reactivation" as const,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(12).toString("hex"),
  };
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = signReactivation(encodedBody);

  return `${encodedBody}.${signature}`;
}

export function readReactivationToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedBody, signature] = token.split(".");
  if (!encodedBody || !signature) {
    return null;
  }

  const expectedSignature = signReactivation(encodedBody);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  let payload: SessionPayload & { purpose?: string };
  try {
    payload = JSON.parse(base64UrlDecode(encodedBody)) as SessionPayload & { purpose?: string };
  } catch {
    return null;
  }

  if (payload.purpose !== "reactivation" || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    exp: payload.exp,
  };
}

export function readSessionToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedBody, signature] = token.split(".");

  if (!encodedBody || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedBody);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  let payload: SessionPayload & { purpose?: string };

  try {
    payload = JSON.parse(base64UrlDecode(encodedBody)) as SessionPayload & { purpose?: string };
  } catch {
    return null;
  }

  if (payload.purpose || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  } catch {
    // Next.js App Router prevents mutating cookies during Server Component rendering.
    // Swallow safely so callers do not crash.
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return null;

  if (!process.env.DATABASE_URL) {
    return session;
  }

  try {
    const user = await withServerCache(
      `active-user:${session.userId}`,
      async () => {
        const { prisma } = await import("@/lib/db");
        return prisma.user.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        });
      },
      { ttlMs: 30_000, tags: [`user-session:${session.userId}`] }
    );

    if (!user || user.status !== "active") {
      invalidateUserSessionCache(session.userId);
      await clearSessionCookie();
      return null;
    }

    return {
      ...session,
      email: user.email || session.email,
      role: user.role as "USER" | "ADMIN",
    };
  } catch {
    return null;
  }
}

export async function getCurrentActiveUser() {
  const session = await getCurrentSession();
  if (!session) return null;

  return {
    ...session,
    status: "active" as const,
  };
}

export async function assertOnboarded(redirectToPath?: string) {
  const session = await getCurrentSession();
  if (!session) {
    const loginTarget = redirectToPath
      ? `/iniciar-sesion?redirect=${encodeURIComponent(redirectToPath)}`
      : "/iniciar-sesion";
    redirect(loginTarget);
  }

  let isOnboarded = false;
  try {
    const checkResult = await withServerCache(
      `onboarded-user:${session.userId}`,
      async () => {
        const { prisma } = await import("@/lib/db");
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            status: true,
            profile: { select: { isOnboarded: true } },
            specialistProfile: { select: { userId: true } },
            specialistPostulations: { select: { id: true }, take: 1 },
          },
        });

        if (!user || user.status !== "active") {
          return { active: false, onboarded: false };
        }

        let onboarded = !!user.profile?.isOnboarded;

        if (!onboarded) {
          if (user.specialistProfile || user.specialistPostulations.length > 0) {
            await prisma.userProfile.upsert({
              where: { userId: session.userId },
              create: { userId: session.userId, isOnboarded: true },
              update: { isOnboarded: true },
            });
            onboarded = true;
          }
        }

        return { active: true, onboarded };
      },
      { ttlMs: 30_000, tags: [`user-session:${session.userId}`] }
    );

    if (!checkResult.active) {
      invalidateUserSessionCache(session.userId);
      const loginTarget = redirectToPath
        ? `/iniciar-sesion?redirect=${encodeURIComponent(redirectToPath)}`
        : "/iniciar-sesion";
      redirect(`/api/auth/logout?redirect=${encodeURIComponent(loginTarget)}`);
    }

    isOnboarded = checkResult.onboarded;
    if (!isOnboarded) {
      // Do not keep un-onboarded state cached so completing onboarding reflects immediately
      invalidateUserSessionCache(session.userId);
    }
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Database check failed in assertOnboarded:", error);
  }

  if (!isOnboarded) {
    const signupTarget = redirectToPath
      ? `/unirme/perfil?redirect=${encodeURIComponent(redirectToPath)}`
      : "/unirme/perfil";
    redirect(signupTarget);
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getCurrentSession();
  if (!session) return;

  let destination: string | null = null;
  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        status: true,
        profile: { select: { isOnboarded: true } },
      },
    });

    if (user && user.status === "active") {
      destination = user.profile?.isOnboarded ? "/inicio" : "/unirme/perfil";
    }
  } catch (error) {
    console.error("Database check failed in redirectIfAuthenticated:", error);
  }

  if (destination) {
    redirect(destination);
  }
}
