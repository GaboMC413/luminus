import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, userId } = body; // action can be 'accept', 'decline', or 'remove'

    if (action !== "remove" && !id) {
      return NextResponse.json({ message: "ID de postulación es requerido." }, { status: 400 });
    }
    if (action === "remove" && !userId) {
      return NextResponse.json({ message: "ID de usuario es requerido." }, { status: 400 });
    }
    if (!action) {
      return NextResponse.json({ message: "Acción es requerida." }, { status: 400 });
    }


    if (action === "accept") {
      const postulation = await prisma.specialistPostulation.findUnique({
        where: { id },
      });

      if (!postulation) {
        return NextResponse.json({ message: "Postulación no encontrada." }, { status: 404 });
      }

      // Update postulation status to accepted
      await prisma.specialistPostulation.update({
        where: { id },
        data: { status: "accepted" },
      });

      // Create or update SpecialistProfile
      await prisma.specialistProfile.upsert({
        where: { userId: postulation.userId },
        update: {
          specialty: postulation.specialty,
          title: postulation.title,
          clinicName: postulation.clinicName,
          bio: postulation.bio,
          linkedinUrl: postulation.linkedinUrl,
          instagramUrl: postulation.instagramUrl,
          websiteUrl: postulation.websiteUrl,
          institution: postulation.institution,
          selectedAreas: postulation.selectedAreas || undefined,
          resumeUrl: postulation.resumeUrl,
        },
        create: {
          userId: postulation.userId,
          specialty: postulation.specialty,
          title: postulation.title,
          clinicName: postulation.clinicName,
          bio: postulation.bio,
          linkedinUrl: postulation.linkedinUrl,
          instagramUrl: postulation.instagramUrl,
          websiteUrl: postulation.websiteUrl,
          institution: postulation.institution,
          selectedAreas: postulation.selectedAreas || undefined,
          resumeUrl: postulation.resumeUrl,
        },
      });

      // Handle spaces (SpecialistSpace) and availability (SpecialistAvailability)
      if (postulation.clinicData && typeof postulation.clinicData === "object") {
        const cData = postulation.clinicData as any;
        const existingSpace = await prisma.specialistSpace.findFirst({
          where: { userId: postulation.userId },
        });

        const rawCategories: string[] = Array.isArray(cData.spaceCategories) ? cData.spaceCategories : (cData.categoryArea ? [cData.categoryArea] : []);
        const primaryCategoryName = rawCategories[0] || cData.categoryArea || null;
        let categoryId: string | null = null;

        if (primaryCategoryName) {
          const categoryRecord = await prisma.interestCategory.findFirst({
            where: {
              name: { equals: primaryCategoryName, mode: "insensitive" },
            },
          });
          if (categoryRecord) {
            categoryId = categoryRecord.id;
          }
        }

        const spacePayload = {
          userId: postulation.userId,
          spaceType: cData.spaceType || null,
          customSpaceType: cData.customSpaceType || null,
          categoryArea: primaryCategoryName,
          categoryId,
          name: cData.clinicName || "Consultorio principal",
          description: cData.clinicDescription || null,
          address: cData.clinicAddress || null,
          city: cData.clinicCity || null,
          country: cData.clinicCountry || null,
          lat: cData.clinicLat !== null && cData.clinicLat !== undefined ? Number(cData.clinicLat) : null,
          lng: cData.clinicLng !== null && cData.clinicLng !== undefined ? Number(cData.clinicLng) : null,
          googlePlaceId: cData.googlePlaceId || null,
          googleMapsUrl: cData.googleMapsUrl || null,
          phone: cData.clinicPhone || null,
          website: cData.clinicWebsite || null,
          coverUrl: cData.clinicCoverUrl || null,
          isActive: true,
        };

        let spaceId: string;
        if (existingSpace) {
          const updatedSpace = await prisma.specialistSpace.update({
            where: { id: existingSpace.id },
            data: spacePayload,
          });
          spaceId = updatedSpace.id;
        } else {
          const createdSpace = await prisma.specialistSpace.create({
            data: spacePayload,
          });
          spaceId = createdSpace.id;
        }

        // Handle multi-categories (SpecialistSpaceCategory)
        await prisma.specialistSpaceCategory.deleteMany({
          where: { spaceId },
        });

        if (rawCategories.length > 0) {
          const matchingDbCategories = await prisma.interestCategory.findMany({
            where: {
              name: { in: rawCategories, mode: "insensitive" },
            },
          });

          if (matchingDbCategories.length > 0) {
            await prisma.specialistSpaceCategory.createMany({
              data: matchingDbCategories.map((c) => ({
                spaceId,
                categoryId: c.id,
              })),
              skipDuplicates: true,
            });
          }
        }

        // Handle services and activities (SpecialistSpaceService)
        await prisma.specialistSpaceService.deleteMany({
          where: { spaceId },
        });

        const rawServices: Array<{ name: string; categoryName: string; isCustom?: boolean }> = Array.isArray(cData.spaceServices)
          ? cData.spaceServices
          : [];

        if (rawServices.length > 0) {
          const allDbCategories = await prisma.interestCategory.findMany();
          const categoryMap = new Map<string, string>();
          allDbCategories.forEach((cat) => {
            categoryMap.set(cat.name.toLowerCase(), cat.id);
          });

          const servicesToInsert = rawServices
            .map((svc) => {
              const matchedId = categoryMap.get((svc.categoryName || "").toLowerCase()) || categoryId;
              if (!matchedId || !svc.name) return null;
              return {
                spaceId,
                categoryId: matchedId,
                name: svc.name,
                isCustom: !!svc.isCustom,
              };
            })
            .filter(Boolean) as Array<{ spaceId: string; categoryId: string; name: string; isCustom: boolean }>;

          if (servicesToInsert.length > 0) {
            await prisma.specialistSpaceService.createMany({
              data: servicesToInsert,
            });
          }
        }

        // Handle availability (SpecialistAvailability)
        if (postulation.sessionsData && typeof postulation.sessionsData === "object") {
          const sData = postulation.sessionsData as any;
          if (sData.enabled && Array.isArray(sData.selectedDays)) {
            // Delete old availability for this space
            await prisma.specialistAvailability.deleteMany({
              where: { spaceId },
            });

            const dayMap: Record<string, number> = {
              "lunes": 0, "lun": 0,
              "martes": 1, "mar": 1,
              "miércoles": 2, "miercoles": 2, "mie": 2,
              "jueves": 3, "jue": 3,
              "viernes": 4, "vie": 4,
              "sábado": 5, "sabado": 5, "sab": 5,
              "domingo": 6, "dom": 6
            };

            const availabilities = sData.selectedDays.map((dayName: string) => {
              const cleanedName = dayName.trim().toLowerCase();
              const dayOfWeek = dayMap[cleanedName] !== undefined ? dayMap[cleanedName] : 0;
              return {
                spaceId,
                dayOfWeek,
                startTime: sData.startTime || "09:00",
                endTime: sData.endTime || "18:00",
                isActive: true,
              };
            });

            if (availabilities.length > 0) {
              await prisma.specialistAvailability.createMany({
                data: availabilities,
              });
            }
          }
        }
      }

      // Handle courses (SpecialistCourse)
      if (postulation.courses && Array.isArray(postulation.courses)) {
        await prisma.specialistCourse.deleteMany({
          where: { userId: postulation.userId },
        });

        const coursesData = postulation.courses.map((c: any) => ({
          userId: postulation.userId,
          name: c.name || "Curso",
          type: c.type || null,
          description: c.description || "",
          modality: c.modality || null,
          url: c.url || null,
          coverUrl: c.coverUrl || null,
          institution: c.institution || null,
          isActive: true,
        }));

        if (coursesData.length > 0) {
          await prisma.specialistCourse.createMany({
            data: coursesData,
          });
        }
      }

      // Log action
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "ACCEPT_SPECIALIST",
          details: JSON.stringify({ targetUserId: postulation.userId }),
        },
      });
    } else if (action === "decline") {
      const postulation = await prisma.specialistPostulation.findUnique({
        where: { id },
      });

      if (!postulation) {
        return NextResponse.json({ message: "Postulación no encontrada." }, { status: 404 });
      }

      // Update postulation status to declined
      await prisma.specialistPostulation.update({
        where: { id },
        data: { status: "declined" },
      });

      // Log action
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "DECLINE_SPECIALIST",
          details: JSON.stringify({ targetUserId: postulation.userId }),
        },
      });
    } else if (action === "remove") {
      // Delete SpecialistProfile
      await prisma.specialistProfile.delete({
        where: { userId },
      });

      // Update their postulations to declined (or delete them)
      await prisma.specialistPostulation.updateMany({
        where: { userId, status: "accepted" },
        data: { status: "declined" },
      });

      // Log action
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "REMOVE_SPECIALIST",
          details: JSON.stringify({ targetUserId: userId }),
        },
      });
    } else if (action === "update") {
      if (!userId) {
        return NextResponse.json({ message: "ID de usuario es requerido." }, { status: 400 });
      }

      const { specialty, title, clinicName, bio, linkedinUrl, instagramUrl, websiteUrl } = body;

      const updatedSpec = await prisma.specialistProfile.update({
        where: { userId },
        data: {
          specialty: String(specialty || ""),
          title: String(title || ""),
          clinicName: clinicName ? String(clinicName) : null,
          bio: String(bio || ""),
          linkedinUrl: linkedinUrl ? String(linkedinUrl) : null,
          instagramUrl: instagramUrl ? String(instagramUrl) : null,
          websiteUrl: websiteUrl ? String(websiteUrl) : null,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      // Log action
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_SPECIALIST",
          details: JSON.stringify({ targetUserId: userId }),
        },
      });

      return NextResponse.json({ ok: true, specialist: updatedSpec });
    } else {
      return NextResponse.json({ message: "Acción no soportada." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to process postulation action:", error);
    return NextResponse.json({ message: "Error al procesar la acción." }, { status: 500 });
  }
}
