import { Suspense } from "react";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ContactClientForm } from "./ContactClientForm";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Contacto | LUMINUS",
  description: "Ponte en contacto directo con el equipo de LUMINUS.",
};

export default async function ContactoPage() {
  const session = await getCurrentSession();

  let userDisplay = {
    name: "",
    email: session?.email || "",
    phone: "",
  };

  if (session?.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              fullName: true,
              phoneNumber: true,
            },
          },
        },
      });

      if (user) {
        userDisplay = {
          name: user.profile?.firstName || user.profile?.fullName?.split(" ")[0] || "",
          email: user.email || session.email || "",
          phone: user.profile?.phoneNumber || "",
        };
      }
    } catch (err) {
      console.error("[ContactoPage] Error fetching user profile:", err);
    }
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col justify-center">
      <Suspense
        fallback={
          <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xs space-y-4">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-full max-w-sm h-4 rounded mb-6" />
            <Skeleton className="w-full h-11 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl mt-4" />
          </div>
        }
      >
        <ContactClientForm userDisplay={userDisplay} />
      </Suspense>
    </div>
  );
}
