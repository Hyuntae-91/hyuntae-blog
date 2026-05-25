"use client";

import { useEffect, useState, useRef } from "react";
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
  initialViews,
  className = "",
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(initialViews ?? null);
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (initialViews !== undefined) {
      setViews(initialViews);
    }
  }, [initialViews]);

  useEffect(() => {
    const storageKey = `viewed_post_${slug}`;
    const lastViewed = localStorage.getItem(storageKey);
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours

    const shouldIncrement =
      increment && (!lastViewed || now - Number(lastViewed) >= ONE_DAY);

    if (!shouldIncrement) {
      // If we shouldn't increment, just fetch current views (GET)
      fetch(`/api/views/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.views === "number") {
            setViews(data.views);
          }
        })
        .catch((err) => console.error("Error fetching views:", err));
      return;
    }

    // Increment views (POST)
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    fetch(`/api/views/${slug}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.views === "number") {
          setViews(data.views);
          localStorage.setItem(storageKey, String(Date.now()));
        }
      })
      .catch((err) => console.error("Error incrementing views:", err));
  }, [slug, increment, initialViews]);

  if (views === null) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <Eye className="h-3.5 w-3.5" />
        <span>...</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <Eye className="h-3.5 w-3.5 text-muted-foreground/80" />
      <span>
        {label}: {views.toLocaleString()}
      </span>
    </span>
  );
}
