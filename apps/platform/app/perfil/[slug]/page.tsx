import { Suspense } from "react";
import { PublicProfileView } from "@/features/user-profile/components/PublicProfileView";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PerfilSlugPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PublicProfileView identifier={decodeURIComponent(slug)} />
    </Suspense>
  );
}
