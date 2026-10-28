import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { ensureS3AvatarUrl } from "@/lib/ensureS3AvatarUrl";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken, reactivate } = body;

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
          trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months trial
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

      // Cache avatar to S3 asynchronously for brand new users
      if (avatarUrl && user?.id) {
        ensureS3AvatarUrl(avatarUrl, user.id).then(async (s3Url) => {
          if (s3Url && s3Url !== avatarUrl && user) {
            await prisma.userProfile.update({
              where: { userId: user.id },
              data: { avatarUrl: s3Url },
            }).catch(() => null);
          }
        }).catch(() => null);
      }
    } else {
      if (user.status === "deleted") {
        if (reactivate) {
          await prisma.user.update({
            where: { id: user.id },
            data: { status: "active" },
          });
          user.status = "active";
        } else {
          const token = createSessionToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });
          cookies().set("luminus_reactivation_token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 5 * 60,
          });
          return NextResponse.json(
            { code: "REQUIRES_REACTIVATION", message: "Tu cuenta fue eliminada. ¿Deseas reactivarla?" },
            { status: 403 }
          );
        }
      } else if (user.status !== "active") {
        return NextResponse.json(
          { message: "Tu cuenta no está activa. Contacta al equipo de LUMINUS para revisarla." },
          { status: 403 }
        );
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      if (!user.profile) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
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

        if (avatarUrl && user?.id) {
          ensureS3AvatarUrl(avatarUrl, user.id).then(async (s3Url) => {
            if (s3Url && s3Url !== avatarUrl && user) {
              await prisma.userProfile.update({
                where: { userId: user.id },
                data: { avatarUrl: s3Url },
              }).catch(() => null);
            }
          }).catch(() => null);
        }
      } else {
        // If profile exists, fill in avatarUrl or names if they were missing!
        const needsAvatar = !user.profile.avatarUrl && Boolean(avatarUrl);
        const needsFirstName = !user.profile.firstName && Boolean(firstName);
        const needsLastName = !user.profile.lastName && Boolean(lastName);

        if (needsAvatar || needsFirstName || needsLastName) {
          const resolvedAvatar = needsAvatar ? avatarUrl : user.profile.avatarUrl;
          const updatedProfile = await prisma.userProfile.update({
            where: { userId: user.id },
            data: {
              avatarUrl: resolvedAvatar || undefined,
              firstName: user.profile.firstName || firstName || undefined,
              lastName: user.profile.lastName || lastName || undefined,
              fullName: user.profile.fullName || `${firstName} ${lastName}`.trim() || undefined,
            },
          });
          user.profile = updatedProfile;

          if (needsAvatar && avatarUrl && user?.id) {
            ensureS3AvatarUrl(avatarUrl, user.id).then(async (s3Url) => {
              if (s3Url && s3Url !== avatarUrl && user) {
                await prisma.userProfile.update({
                  where: { userId: user.id },
                  data: { avatarUrl: s3Url },
                }).catch(() => null);
              }
            }).catch(() => null);
          }
        }
      }
    }

    // 3. Create session token and set cookie
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setSessionCookie(sessionToken);

    try {
      if (isNewUser) {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "USER_CREATED",
            details: JSON.stringify({ email: user.email, provider: "facebook" }),
          },
        });
      }
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          details: JSON.stringify({ email: user.email, provider: "facebook" }),
        },
      });
    } catch (logError) {
      console.error("Failed to log activity in Facebook auth:", logError);
    }

    const isOnboarded = user.profile?.isOnboarded ?? false;

    return NextResponse.json({
      ok: true,
      isNewUser,
      isOnboarded,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
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
