import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { type PostMeta } from "@/lib/posts";
import { formatPostDate } from "@/lib/date";

interface PostListProps {
  posts: PostMeta[];
  // 목록에서 쓰는 사전 키만 좁게 받는다(원문 배지 라벨).
  dict: { post: { original: string } };
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
  hrefFor,
  categoryLabelFor,
  showCategory = true,
}: PostListProps) {
  // 조회수는 목록에 노출하지 않는다(신생 블로그라 낮은 숫자가 오히려 신뢰를 깎는다).
  // 대신 글의 한 줄 요약(description)을 보여 클릭 동기를 만든다.
  return (
    <div className="space-y-1">
      {posts.map((post) => {
        const href = hrefFor
          ? hrefFor(post)
          : `/${post.hrefLocale}/blog/${post.slug}`;
        return (
          <Link
            key={post.slug}
            href={href}
            className="block rounded-lg px-3 py-4 transition-colors hover:bg-accent"
          >
            <div className="flex flex-wrap items-center gap-2">
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
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatPostDate(post.date)}
              </span>
            </div>
            {post.description && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {post.description}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
