"use client";

import { useEffect, useRef } from "react";
import { Eye } from "lucide-react";

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
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!increment || hasIncremented.current) return;

    const storageKey = `viewed_post_${slug}`;
    const lastViewed = localStorage.getItem(storageKey);
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours

    // 같은 글을 24시간 내 다시 보면 카운트하지 않는다.
    if (lastViewed && now - Number(lastViewed) < ONE_DAY) return;

    hasIncremented.current = true;

    // 조회수는 백그라운드에서만 증가시킨다. 화면 숫자는 서버(ISR) 값을 유지해
    // 본인의 증가분은 다음 재생성 때 반영된다 → 1→4 같은 깜빡임 없음.
    fetch(`/api/views/${slug}`, { method: "POST" })
      .then(() => localStorage.setItem(storageKey, String(Date.now())))
      .catch((err) => console.error("Error incrementing views:", err));
  }, [slug, increment]);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <Eye className="h-3.5 w-3.5 text-muted-foreground/80" />
      <span>
        {label}: {initialViews.toLocaleString()}
      </span>
    </span>
  );
}
