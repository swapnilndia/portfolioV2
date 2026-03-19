import { calculateLeetCodeStreakFromDays } from "./leetcodeStreak";

describe("calculateLeetCodeStreakFromDays", () => {
  it("returns 0 when there are no days", () => {
    expect(calculateLeetCodeStreakFromDays([])).toBe(0);
  });

  it("counts consecutive UTC days ending at today or yesterday", () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    const now = new Date();
    const d0 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const d1 = new Date(d0);
    d1.setUTCDate(d1.getUTCDate() - 1);
    const d2 = new Date(d1);
    d2.setUTCDate(d2.getUTCDate() - 1);
    const days = [
      { date: fmt(d0), count: 1 },
      { date: fmt(d1), count: 2 },
      { date: fmt(d2), count: 1 },
    ];
    expect(calculateLeetCodeStreakFromDays(days)).toBe(3);
  });
});
