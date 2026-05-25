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
    if (!increment) {
      // If not incrementing and initialViews is not provided, fetch current views
      if (initialViews === undefined) {
        fetch(`/api/views/${slug}`)
          .then((res) => res.json())
          .then((data) => {
            if (typeof data.views === "number") {
              setViews(data.views);
            }
          })
          .catch((err) => console.error("Error fetching views:", err));
      }
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
