import { redirect } from "next/navigation";

export default function LegacySignUpRedirect({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const target = searchParams?.redirect
    ? `/unirme?redirect=${encodeURIComponent(searchParams.redirect)}`
    : "/unirme";
  redirect(target);
}

