import { redirect } from "next/navigation";

interface LegacyPublicProfilePageProps {
  searchParams: Promise<{
    id?: string;
    from?: string;
  }>;
}

export default async function LegacyPublicProfilePage({ searchParams }: LegacyPublicProfilePageProps) {
  const { id, from } = await searchParams;

  if (!id) {
    redirect("/inicio");
  }

  const query = from ? `?from=${encodeURIComponent(from)}` : "";
  redirect(`/perfil/${encodeURIComponent(id)}${query}`);
}
