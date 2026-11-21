export const pad = (n) => String(n).padStart(2, '0');

export const keyOf = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayDate = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export const getCalendar = (viewOffset) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + viewOffset, 1);
  const y = d.getFullYear();
  const m = d.getMonth();
  const n = new Date(y, m + 1, 0).getDate();
  const isCurrent = viewOffset === 0;
  const t = viewOffset < 0 ? n : isCurrent ? now.getDate() : 0;
  const today = isCurrent ? now.getDate() : 0;
  const monthEnd = new Date(y, m, n);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = monthEnd < todayStart ? monthEnd : todayStart;

  return { d, y, m, t, n, today, end };
};

export const dayKey = (cal, day) => `${cal.y}-${pad(cal.m + 1)}-${pad(day)}`;

export const getWeekSpans = (daysInMonth) =>
  Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, w) => ({
    index: w,
    from: w * 7 + 1,
    to: Math.min(w * 7 + 7, daysInMonth)
  }));