import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { type PostMeta } from "@/lib/posts";
import { formatPostDate } from "@/lib/date";

interface PostListProps {
  posts: PostMeta[];
  dict: any;
  initialViews?: Record<string, number>;
  // 글 URL 빌더. 개발(/blog/[slug])과 취미(/life/[category]/[slug])가 달라 주입한다.
  // 미지정 시 개발 블로그 경로로 폴백한다.
  hrefFor?: (post: PostMeta) => string;
  // 카테고리 배지 라벨을 로케일에 맞게 변환한다. 미지정 시 원본 문자열을 그대로 쓴다.
  categoryLabelFor?: (category: string) => string;
  // 카테고리 페이지처럼 전부 같은 카테고리면 배지가 중복이므로 끈다. 기본값 노출.
  showCategory?: boolean;
}

export function PostList({
  posts,
  dict,
  initialViews = {},
  hrefFor,
  categoryLabelFor,
  showCategory = true,
}: PostListProps) {
  // 조회수는 서버(ISR)에서 내려준 값을 그대로 사용한다. 클라이언트 재요청 없음 → 깜빡임 없음.
  return (
    <div className="space-y-1">
      {posts.map((post) => {
        const views = initialViews[post.slug] ?? 0;
        const href = hrefFor
          ? hrefFor(post)
          : `/${post.hrefLocale}/blog/${post.slug}`;
        return (
          <Link
            key={post.slug}
            href={href}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg px-3 py-4 transition-colors hover:bg-accent gap-2"
          >
            <div className="flex flex-wrap items-center gap-3">
              {showCategory && post.category && (
                <Badge variant="secondary" className="text-xs">
                  {categoryLabelFor
                    ? categoryLabelFor(post.category)
                    : post.category}
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
              <span>{formatPostDate(post.date)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
