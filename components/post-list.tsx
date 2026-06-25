import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { type PostMeta } from "@/lib/posts";

interface PostListProps {
  posts: PostMeta[];
  dict: any;
  initialViews?: Record<string, number>;
}

export function PostList({ posts, dict, initialViews = {} }: PostListProps) {
  // 조회수는 서버(ISR)에서 내려준 값을 그대로 사용한다. 클라이언트 재요청 없음 → 깜빡임 없음.
  return (
    <div className="space-y-1">
      {posts.map((post) => {
        const views = initialViews[post.slug] ?? 0;
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
                <span>{views.toLocaleString()}</span>
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
