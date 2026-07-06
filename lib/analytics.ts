export const INTERNAL_TRAFFIC_COOKIE_NAME = "blog_internal";
export const INTERNAL_TRAFFIC_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function shouldMarkInternalTraffic(
  searchParams: URLSearchParams
): boolean {
  return searchParams.get("internal") === "1";
}

export function shouldLoadAnalytics({
  gaId,
  isInternalVisitor,
}: {
  gaId: string | undefined;
  isInternalVisitor: boolean;
}): boolean {
  return Boolean(gaId) && !isInternalVisitor;
}
