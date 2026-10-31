import { redirect } from "next/navigation";

export default async function LegacySignUpRedirect(
  props: {
    searchParams?: Promise<{ redirect?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const target = searchParams?.redirect
    ? `/unirme?redirect=${encodeURIComponent(searchParams.redirect)}`
    : "/unirme";
  redirect(target);
}

