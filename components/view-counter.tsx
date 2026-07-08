"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { shouldIncrementView } from "@/lib/view-tracking";

interface ViewCounterProps {
  slug: string;
  label: string;
  increment?: boolean;
  initialViews?: number;
  className?: string;
}

export function ViewCounter({
  slug,
  label,
  increment = false,
  initialViews = 0,
  className = "",
}: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const storageKey = `viewed_post_${slug}`;
    const lastViewed = localStorage.getItem(storageKey);
    const now = Date.now();
    const willIncrement = shouldIncrementView({
      increment,
      lastViewedAt: lastViewed ? Number(lastViewed) : null,
      now,
    });

    // 조회수를 항상 최신값으로 가져온다(no-store). Turso는 응답이 빨라서
    // 서버(ISR) 값이 오래돼 있어도 화면 숫자는 방문 즉시 실제 값으로 갱신된다.
    const request = willIncrement
      ? fetch(`/api/views/${slug}`, { method: "POST", cache: "no-store" })
      : fetch(`/api/views/${slug}`, { cache: "no-store" });

    request
      .then((res) => res.json())
      .then((data: { views: number }) => {
        setViews(data.views);
        if (willIncrement) localStorage.setItem(storageKey, String(now));
      })
      .catch((err) => console.error("Error fetching view count:", err));
  }, [slug, increment]);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <Eye className="h-3.5 w-3.5 text-muted-foreground/80" />
      <span>
        {label}: {views.toLocaleString()}
      </span>
    </span>
  );
}
