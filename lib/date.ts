// 글의 정렬 키와 표시값을 분리한다.
// frontmatter의 date는 "YYYY-MM-DD" 또는 "YYYY-MM-DDTHH:mm:ss±hh:mm"(타임존 명시)
// 형식을 쓴다. 시각은 같은 날 여러 글의 순서를 결정하기 위한 것이지 화면에 노출하지 않는다.

// 표시용: 시각/타임존을 떼고 날짜 부분(YYYY-MM-DD)만 남긴다.
// new Date() 파싱은 UTC/로컬 경계에서 날짜가 하루 밀릴 수 있어, 문자열에서 직접 자른다.
export function formatPostDate(date: string): string {
  return date.slice(0, 10);
}

// 정렬용: date(시각 포함) 내림차순. 동일 시각이면 slug 오름차순으로 안정적으로 깬다.
export function comparePostsByDateDesc(
  a: { date: string; slug: string },
  b: { date: string; slug: string }
): number {
  const diff = (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
  if (diff !== 0) return diff;
  return a.slug.localeCompare(b.slug);
}
