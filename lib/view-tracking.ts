export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function shouldIncrementView(params: {
  increment: boolean;
  lastViewedAt: number | null;
  now: number;
  windowMs?: number;
}): boolean {
  const { increment, lastViewedAt, now, windowMs = ONE_DAY_MS } = params;
  if (!increment) return false;
  if (lastViewedAt === null) return true;
  return now - lastViewedAt >= windowMs;
}
