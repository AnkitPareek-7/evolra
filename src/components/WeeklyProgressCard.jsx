import React, { useEffect, useMemo, useState } from 'react';
import { getWeekSpans } from '../utils/date';
import { buildWeekBars } from '../utils/habitStats';
import BarChart from './BarChart';

export default function WeeklyProgressCard({ cal, habits, viewOffset }) {
  const spans = useMemo(() => getWeekSpans(cal.n), [cal.n]);

  const initialWeek = viewOffset === 0 && cal.today > 0 ? Math.floor((cal.today - 1) / 7) : 0;
  const [weekIndex, setWeekIndex] = useState(initialWeek);
  const [slideDir, setSlideDir] = useState('next');

  useEffect(() => {
    if (viewOffset === 0 && cal.today > 0) {
      setWeekIndex(Math.min(Math.floor((cal.today - 1) / 7), spans.length - 1));
    } else {
      setWeekIndex(0);
    }
  }, [viewOffset, cal.today, spans.length]);

  const safeIndex = Math.min(weekIndex, spans.length - 1);
  const activeSpan = spans[safeIndex];
  const weekGroups = useMemo(() => buildWeekBars(habits, cal, activeSpan), [habits, cal, activeSpan]);

  const goWeek = (delta) => {
    const next = safeIndex + delta;
    if (next < 0 || next >= spans.length) return;
    setSlideDir(delta > 0 ? 'next' : 'prev');
    setWeekIndex(next);
  };

  return (
    <div className="card">
      <div className="weekly-head">
        <h2>Weekly Progress</h2>
        <div className="week-nav" aria-label="Select week">
          <button
            type="button"
            className="arrow-btn"
            onClick={() => goWeek(-1)}
            disabled={safeIndex === 0}
            aria-label="Previous week"
            title="Previous week"
          >
            &#8249;
          </button>
          <span className="week-pill">
            Week {safeIndex + 1} <small>(Days {activeSpan.from}–{activeSpan.to})</small>
          </span>
          <button
            type="button"
            className="arrow-btn"
            onClick={() => goWeek(1)}
            disabled={safeIndex >= spans.length - 1}
            aria-label="Next week"
            title="Next week"
          >
            &#8250;
          </button>
        </div>
      </div>

      <div key={`${viewOffset}-${safeIndex}`} className={`week-slide slide-${slideDir}`}>
        <BarChart groups={weekGroups} resetKey={`${viewOffset}-w${safeIndex}`} />
      </div>
    </div>
  );
}