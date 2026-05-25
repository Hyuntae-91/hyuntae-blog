"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { type PostMeta } from "@/lib/posts";

interface PostListProps {
  posts: PostMeta[];
  dict: any;
}

export function PostList({ posts, dict }: PostListProps) {
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/views")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setViewsMap(data);
        }
      })
      .catch((err) => console.error("Error fetching batch views:", err));
  }, []);

  return (
    <div className="space-y-1">
      {posts.map((post) => {
        const views = viewsMap[post.slug] ?? null;
        return (
          <Link
            key={post.slug}
            href={`/${post.hrefLocale}/blog/${post.slug}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg px-3 py-4 transition-colors hover:bg-accent gap-2"
          >
            <div className="flex flex-wrap items-center gap-3">
              {post.category && (
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
              )}
              {!post.isTranslationAvailable && (
                <Badge variant="outline" className="text-xs">
                  {dict.post.original}: {post.sourceLocale.toUpperCase()}
                </Badge>
              )}
              <span className="font-medium text-foreground">{post.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>{views !== null ? views.toLocaleString() : "..."}</span>
              </span>
              <span className="text-muted-foreground/30">|</span>
              <span>{post.date}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
