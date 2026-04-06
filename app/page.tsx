import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, detectPreferredLocale } from "@/lib/locale-helpers";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const params = await searchParams;

  const locale = detectPreferredLocale({
    cookieLocale: cookieStore.get(COOKIE_NAME)?.value,
    country:
      typeof params.country === "string"
        ? params.country
        : headerList.get("x-vercel-ip-country"),
    acceptLanguage: headerList.get("accept-language"),
  });

  redirect(`/${locale}`);
}
