import { redirect } from "next/navigation";

export default function LegacySignInRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") params.set(key, value);
      else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    });
  }
  const queryString = params.toString();
  redirect(queryString ? `/iniciar-sesion?${queryString}` : "/iniciar-sesion");
}
