/**
 * LeetCode submission calendar uses UTC calendar days. Streak = consecutive UTC days
 * with ≥1 submission, starting from today UTC or (if none) yesterday — same idea as GitHub.
 */
export function calculateLeetCodeStreakFromDays(
  days: readonly { date: string; count: number }[]
): number {
  const map = new Map<string, number>();
  for (const d of days) {
    map.set(d.date, d.count);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtUTC = (d: Date) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if ((map.get(fmtUTC(cursor)) ?? 0) === 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (streak <= 366) {
    const key = fmtUTC(cursor);
    if ((map.get(key) ?? 0) > 0) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
