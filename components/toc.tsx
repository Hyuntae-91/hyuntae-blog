"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

/**
 * 데스크탑 우측 sticky 목차. IntersectionObserver로 현재 화면에 보이는
 * heading을 추적해 active 항목을 하이라이트한다.
 */
export function TableOfContents({
  items,
  label,
}: {
  items: TocItem[];
  label: string;
}) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 화면 상단 근처에서 교차하는 heading 중 가장 위의 것을 active로.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // 상단 0%~하단 -70%: 뷰포트 상단 30% 영역에 들어온 heading을 잡는다.
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      <ul className="space-y-1 border-l border-border">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`-ml-px block border-l-2 py-0.5 transition-colors ${
                  item.depth === 3 ? "pl-6" : "pl-3"
                } ${
                  isActive
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
