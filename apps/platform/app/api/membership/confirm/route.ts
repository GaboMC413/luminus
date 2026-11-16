import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors/server-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const {
      subscriptionId,
      paymentMethodId,
      customerId,
      billingInterval,
      cardName,
      email: rawEmail,
      city,
      country,
      firstName: bodyFirstName,
      lastName: bodyLastName,
    } = body || {};

    const { prisma } = await import("@/lib/db");
    const now = new Date();

    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        stripeCustomerId: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    let verifiedCustomerId: string | undefined = customerId ? String(customerId) : undefined;
    let verifiedSubscriptionId: string | undefined = subscriptionId ? String(subscriptionId) : undefined;
    let verifiedInterval: "annual" | "monthly" = billingInterval === "annual" ? "annual" : "monthly";

    const { stripe, createSubscriptionWithPaymentMethod } = await import("@/lib/stripe");
    if (stripe) {
      if (paymentMethodId && !subscriptionId) {
        const targetCustomerId = existingUser.stripeCustomerId || verifiedCustomerId;
        if (!targetCustomerId || String(targetCustomerId).startsWith("cus_mock_")) {
          return NextResponse.json(
            { message: "ID de cliente de Stripe inválido o faltante." },
            { status: 400 }
          );
        }

        try {
          const subResult = await createSubscriptionWithPaymentMethod({
            customerId: String(targetCustomerId),
            paymentMethodId: String(paymentMethodId),
            interval: verifiedInterval === "annual" ? "year" : "month",
            userId: existingUser.id,
            email: existingUser.email,
          });

          if (subResult.requiresAction && subResult.clientSecret) {
            return NextResponse.json({
              requiresAction: true,
              clientSecret: subResult.clientSecret,
              subscriptionId: subResult.subscriptionId,
              customerId: subResult.customerId,
            });
          }

          verifiedSubscriptionId = subResult.subscriptionId;
          verifiedCustomerId = subResult.customerId;
        } catch (stripeErr: any) {
          console.error("Stripe subscription creation error:", stripeErr);
          return NextResponse.json(
            { message: stripeErr.message || "Tu tarjeta fue rechazada. Verifica los datos o intenta con otro método." },
            { status: 400 }
          );
        }
      } else {
        if (!subscriptionId || String(subscriptionId).startsWith("sub_mock_")) {
          return NextResponse.json(
            { message: "ID de suscripción inválido o faltante." },
            { status: 400 }
          );
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(String(subscriptionId), {
            expand: ["latest_invoice.payment_intent"],
          });

          const subCustomerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;

          const metadataUserId = subscription.metadata?.userId;
          const metadataEmail = subscription.metadata?.user_email?.trim().toLowerCase();

          const isOwner =
            (existingUser.stripeCustomerId && subCustomerId === existingUser.stripeCustomerId) ||
            (metadataUserId && metadataUserId === existingUser.id) ||
            (metadataEmail && metadataEmail === existingUser.email.trim().toLowerCase());

          if (!isOwner) {
            return NextResponse.json(
              { message: "Esta suscripción no pertenece a la cuenta autenticada." },
              { status: 403 }
            );
          }

          const invoice = subscription.latest_invoice as any;
          const paymentIntent = invoice?.payment_intent;
          const isPaid =
            subscription.status === "active" ||
            subscription.status === "trialing" ||
            paymentIntent?.status === "succeeded";

          if (!isPaid) {
            return NextResponse.json(
              { message: "El pago de la suscripción aún no ha sido confirmado por Stripe." },
              { status: 400 }
            );
          }

          if (subCustomerId) {
            verifiedCustomerId = subCustomerId;
          }
          verifiedSubscriptionId = subscription.id;

          const stripePriceInterval = subscription.items?.data?.[0]?.price?.recurring?.interval;
          if (stripePriceInterval === "year") {
            verifiedInterval = "annual";
          } else if (stripePriceInterval === "month") {
            verifiedInterval = "monthly";
          }
        } catch (stripeErr: any) {
          console.error("Stripe subscription verification error:", stripeErr);
          return NextResponse.json(
            { message: stripeErr.message || "Error al verificar la suscripción con Stripe." },
            { status: 400 }
          );
        }
      }
    }

    const nameParts = cardName ? String(cardName).trim().split(/\s+/) : [];
    const firstName = bodyFirstName ? String(bodyFirstName).trim() : (nameParts[0] || undefined);
    const lastName = bodyLastName ? String(bodyLastName).trim() : (nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined);
    const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (cardName ? String(cardName).trim() : undefined);

    const targetEmail = rawEmail ? String(rawEmail).trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isTargetEmailValid = Boolean(
      targetEmail &&
      emailRegex.test(targetEmail) &&
      !(targetEmail.startsWith("facebook_") && targetEmail.endsWith("@luminus.lat"))
    );

    const isCurrentEmailPlaceholder =
      existingUser.email.startsWith("facebook_") && existingUser.email.endsWith("@luminus.lat");

    let needsEmailUpdate = false;
    let resolvedEmail: string = existingUser.email;
    const receiptEmail: string = isTargetEmailValid ? targetEmail : existingUser.email;

    if (isTargetEmailValid && targetEmail && isCurrentEmailPlaceholder) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          email: targetEmail,
          id: { not: existingUser.id },
        },
      });

      if (duplicateUser) {
        return NextResponse.json(
          { message: "El correo electrónico ya está registrado en otra cuenta. Por favor utiliza otro." },
          { status: 400 }
        );
      }

      needsEmailUpdate = true;
      resolvedEmail = targetEmail;
    }

    const hasProfileName = Boolean(existingUser?.profile?.firstName || existingUser?.profile?.lastName);

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(needsEmailUpdate ? { email: resolvedEmail } : {}),
        tier: "MECENAS",
        memberSince: now,
        stripeCustomerId: verifiedCustomerId,
        stripeSubscriptionId: verifiedSubscriptionId,
        profile: {
          upsert: {
            create: {
              selectedPlan: verifiedInterval === "annual" ? "Annual" : "Monthly",
              city: city ? String(city).trim() : undefined,
              country: country ? String(country).trim() : undefined,
              firstName,
              lastName,
              fullName,
            },
            update: {
              selectedPlan: verifiedInterval === "annual" ? "Annual" : "Monthly",
              ...(city ? { city: String(city).trim() } : {}),
              ...(country ? { country: String(country).trim() } : {}),
              ...(!hasProfileName && firstName ? { firstName } : {}),
              ...(!hasProfileName && lastName ? { lastName } : {}),
              ...(!hasProfileName && fullName ? { fullName } : {}),
            },
          },
        },
      },
      include: { profile: true },
    });

    if (
      stripe &&
      verifiedCustomerId &&
      !String(verifiedCustomerId).startsWith("cus_mock_") &&
      (needsEmailUpdate || receiptEmail !== existingUser.email)
    ) {
      await stripe.customers.update(String(verifiedCustomerId), { email: receiptEmail }).catch((stripeCustErr: any) => {
        console.warn("[confirm] Failed to update Stripe customer email:", stripeCustErr);
      });
    }

    if (needsEmailUpdate) {
      const { createSessionToken, setSessionCookie } = await import("@/lib/auth/session");
      const updatedToken = createSessionToken({
        userId: existingUser.id,
        email: resolvedEmail,
        role: existingUser.role,
      });
      await setSessionCookie(updatedToken);
    }

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "MEMBERSHIP_ACTIVATED",
          details: JSON.stringify({
            tier: "MECENAS",
            subscriptionId,
            email: resolvedEmail,
            receiptEmail,
            emailUpdated: needsEmailUpdate,
            timestamp: now.toISOString(),
          }),
        },
      });
    } catch (logErr) {
      console.error("Failed to log membership activation:", logErr);
    }

    // Trigger upgrade email only if this is an existing user who already completed onboarding
    const isAlreadyOnboarded = Boolean(updatedUser.profile?.isOnboarded);
    if (isAlreadyOnboarded) {
      try {
        const { sendMecenasUpgradeEmail } = await import("@/lib/mails/sender");
        const upgradeName = updatedUser.profile?.firstName || updatedUser.profile?.fullName || undefined;
        await sendMecenasUpgradeEmail(resolvedEmail, {
          name: upgradeName,
          interval: verifiedInterval === "annual" ? "year" : "month",
        });
      } catch (emailErr) {
        console.error("Failed to send mecenas upgrade email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      tier: updatedUser.tier,
      memberSince: updatedUser.memberSince,
      email: updatedUser.email,
    });
  } catch (error: unknown) {
    return handleApiError(error, {
      context: "[membership/confirm] POST",
      message: "Error al confirmar la membresía.",
    });
  }
}
