"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Users, Globe } from "lucide-react";
import { Locale } from "@/lib/locale-helpers";

interface FooterProps {
  locale: Locale;
  dict: {
    nav: {
      blog: string;
      life: string;
      about: string;
    };
    stats: {
      todayVisitors: string;
      totalVisitors: string;
    };
  };
}

export function Footer({ locale, dict }: FooterProps) {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    // Send a POST request to log the visit and fetch latest statistics
    fetch("/api/visitors", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.today === "number" && typeof data.total === "number") {
          setStats({ today: data.today, total: data.total });
        }
      })
      .catch((err) => console.error("Error logging visitor stats:", err));
  }, []);

  return (
    <footer className="border-t border-border bg-background/80 py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <nav className="flex items-center gap-4 text-xs">
            <Link href={`/${locale}/blog`} className="transition-colors hover:text-foreground">
              {dict.nav.blog}
            </Link>
            <Link href={`/${locale}/life`} className="transition-colors hover:text-foreground">
              {dict.nav.life}
            </Link>
            <Link href={`/${locale}/about`} className="transition-colors hover:text-foreground">
              {dict.nav.about}
            </Link>
          </nav>
          <p>© {new Date().getFullYear()} hyuntae. All rights reserved.</p>
        </div>
        {stats && (
          <div className="flex items-center gap-4 text-xs font-medium bg-muted/50 border border-border px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span>
                {dict.stats.todayVisitors}: <strong>{stats.today.toLocaleString()}</strong>
              </span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span>
                {dict.stats.totalVisitors}: <strong>{stats.total.toLocaleString()}</strong>
              </span>
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
