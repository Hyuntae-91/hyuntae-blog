import type { PostMeta } from "./posts";

// 관련 글 랭킹: 공유 태그 수 기준, 같은 카테고리는 가산점. 겹치는 태그가 없으면 제외.
// 글 상세(개발·취미 공용)에서 사용한다. 순수 함수라 단위 테스트 대상이다.
export function rankRelatedPosts(
  posts: PostMeta[],
  current: { slug: string; tags: string[]; category: string },
  limit = 3
): PostMeta[] {
  const tagSet = new Set(current.tags);
  return posts
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => tagSet.has(tag)).length;
      const score = sharedTags + (post.category === current.category ? 0.5 : 0);
      return { post, sharedTags, score };
    })
    .filter((item) => item.sharedTags > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}
