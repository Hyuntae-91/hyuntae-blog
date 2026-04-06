"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { locales, type Locale, replacePathLocale } from "@/lib/locale-helpers";

const localeLabels: Record<Locale, string> = { ko: "KO", en: "EN", ja: "JA" };

interface HeaderProps {
  locale: Locale;
  dict: {
    nav: { blog: string; about: string };
  };
}

export function Header({ locale, dict }: HeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const isActive = (path: string) =>
    pathname.startsWith(`/${locale}${path}`);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="text-lg font-bold tracking-tight"
        >
          hyuntae's blog
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href={`/${locale}/blog`}
            className={`text-sm transition-colors ${isActive("/blog") ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {dict.nav.blog}
          </Link>
          <Link
            href={`/${locale}/about`}
            className={`text-sm transition-colors ${isActive("/about") ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {dict.nav.about}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/api/locale?locale=${l}&redirect=${encodeURIComponent(replacePathLocale(pathname, l))}`}
                prefetch={false}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === l
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={locale === l ? "page" : undefined}
              >
                {localeLabels[l]}
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            type="button"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
