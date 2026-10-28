import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken } = body;

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { message: "Token de acceso de Facebook requerido." },
        { status: 400 }
      );
    }

    // 1. Validate token with Meta Graph API
    const fbResponse = await fetch(
      `https://graph.facebook.com/v20.0/me?fields=id,name,first_name,last_name,email,picture.width(400).height(400)&access_token=${encodeURIComponent(
        accessToken
      )}`
    );

    if (!fbResponse.ok) {
      const fbError = await fbResponse.json().catch(() => ({}));
      console.error("Facebook token verification failed:", fbError);
      return NextResponse.json(
        { message: "No pudimos validar tu sesión de Facebook." },
        { status: 401 }
      );
    }

    const fbUser = await fbResponse.json();
    const fbId = fbUser.id;
    const email = fbUser.email ? fbUser.email.trim().toLowerCase() : `facebook_${fbId}@luminus.lat`;
    const firstName = fbUser.first_name || fbUser.name?.split(" ")[0] || "";
    const lastName = fbUser.last_name || fbUser.name?.split(" ").slice(1).join(" ") || "";
    const avatarUrl = fbUser.picture?.data?.url || "";

    const cognitoSub = `facebook_${fbId}`;

    // 2. Find or create user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ cognitoSub }, { email }],
      },
      include: { profile: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email,
          cognitoSub,
          emailVerified: true,
          authProvider: "unknown",
          role: "USER",
          status: "active",
          profile: {
            create: {
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim() || undefined,
              avatarUrl: avatarUrl || undefined,
              isOnboarded: false,
            },
          },
        },
        include: { profile: true },
      });
    } else {
      // If user exists by email but without this cognitoSub, ensure profile has picture/name if empty
      if (!user.cognitoSub.startsWith("facebook_") && user.email === email) {
        // Link or update
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            lastLoginAt: new Date(),
          },
        });
      }

      if (!user.profile) {
        await prisma.userProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim() || undefined,
            avatarUrl: avatarUrl || undefined,
            isOnboarded: false,
          },
        });
      }
    }

    // 3. Create session token and set cookie
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setSessionCookie(sessionToken);

    const isOnboarded = user.profile?.isOnboarded ?? false;

    return NextResponse.json({
      ok: true,
      isNewUser,
      isOnboarded,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Facebook login endpoint error:", error);
    return NextResponse.json(
      { message: "Error interno al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
