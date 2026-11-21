import { dayKey, getWeekSpans, keyOf, todayDate } from './date';

export const pct = (n, total) => (total > 0 ? (n / total) * 100 : 0);
export const fmtPct = (v) => `${+v.toFixed(1)}%`;

const countRange = (habit, cal, from, to) => {
  let count = 0;
  for (let d = from; d <= to; d += 1) {
    if (habit.done[dayKey(cal, d)]) count += 1;
  }
  return count;
};

const weekGoal = (habit, spanLength) =>
  spanLength >= 7 ? habit.goal : Math.max(1, Math.round((habit.goal * spanLength) / 7));

export function buildWeekBars(habits, cal, span) {
  return habits.map((h) => {
    const ticks = countRange(h, cal, span.from, span.to);
    const goal = weekGoal(h, span.to - span.from + 1);
    const value = Math.min(100, pct(ticks, goal));
    return {
      label: h.name,
      bars: [
        {
          v: value,
          c: h.color,
          t: `${h.name}: ${ticks} of ${goal} (${fmtPct(value)})`
        }
      ]
    };
  });
}

export function buildMonthlyBars(habits, cal) {
  const spans = getWeekSpans(cal.n);
  return habits.map((h) => {
    let got = 0;
    let need = 0;
    spans.forEach((s) => {
      const ticks = countRange(h, cal, s.from, s.to);
      const goal = weekGoal(h, s.to - s.from + 1);
      got += Math.min(ticks, goal);
      need += goal;
    });
    const value = pct(got, need);
    return {
      label: h.name,
      bars: [
        {
          v: value,
          c: h.color,
          t: `${h.name}: ${got} of ${need} (${fmtPct(value)})`
        }
      ]
    };
  });
}

export function buildConsistencyBars(habits, cal) {
  const endKey = keyOf(cal.end);
  return habits.map((h) => {
    const daysUsed = Math.round((cal.end - new Date(`${h.start}T00:00`)) / 864e5) + 1;
    const ticks = Object.keys(h.done).filter((k) => k <= endKey).length;
    const expected = (h.goal * daysUsed) / 7;
    const value = daysUsed > 0 ? Math.min(100, pct(ticks, expected)) : 0;
    const note = daysUsed > 0 ? `${ticks} of ${+expected.toFixed(1)} (${fmtPct(value)})` : fmtPct(0);
    return {
      label: h.name,
      bars: [{ v: value, c: h.color, t: `${h.name}: ${note}` }]
    };
  });
}

export function streakOf(habit) {
  const d = todayDate();
  if (!habit.done[keyOf(d)]) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (habit.done[keyOf(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function buildTargetStreakBars(habits, targetDays) {
  return habits.map((h) => {
    const streak = streakOf(h);
    const progress = pct(streak, targetDays);
    return {
      label: h.name,
      bars: [
        {
          v: Math.min(progress, 100),
          c: h.color,
          t: `${h.name}: ${streak} of ${targetDays} days (${fmtPct(progress)})`
        }
      ]
    };
  });
}