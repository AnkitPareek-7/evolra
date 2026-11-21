import React, { useEffect, useRef, useState } from 'react';
import { DAY_NAMES, LIMITS, goalLabel, normGoal } from '../constants/config';
import { dayKey } from '../utils/date';
import CelebrationBurst from './CelebrationBurst';

export default function HabitGrid({
  cal,
  habits,
  onPrevMonth,
  onNextMonth,
  onToggleDay,
  onAddHabit,
  onOpenDialog
}) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(7);
  const [burstCell, setBurstCell] = useState(null);
  const burstTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(burstTimerRef.current), []);

  const days = Array.from({ length: cal.n }, (_, i) => i + 1);
  const weeks = Math.ceil(cal.n / 7);
  const monthLabel = cal.d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddHabit(trimmed, normGoal(Number(goal)));
    setName('');
  };

  const handleCheckboxChange = (habitId, key, checked) => {
    onToggleDay(habitId, key, checked);
    if (checked) {
      const cellKey = `${habitId}:${key}`;
      setBurstCell(cellKey);
      clearTimeout(burstTimerRef.current);
      burstTimerRef.current = setTimeout(() => setBurstCell(null), 650);
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <div className="month-nav">
          <button type="button" className="rename-btn" onClick={onPrevMonth} title="Previous month">
            Prev
          </button>
          <h2 id="monthLabel">{monthLabel}</h2>
          <button type="button" className="rename-btn" onClick={onNextMonth} title="Next month">
            Next
          </button>
        </div>

        <div className="head-actions">
          <button type="button" className="rename-btn" onClick={() => onOpenDialog('rename')} title="Edit habit">
            Edit
          </button>
          <button type="button" className="rename-btn" onClick={() => onOpenDialog('delete')} title="Delete habit">
            Delete
          </button>
          <form className="add-habit-form" onSubmit={handleSubmit}>
            <input
              id="habitInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New habit…"
              maxLength={LIMITS.NAME_MAX}
              aria-label="New habit name"
              required
            />
            <select
              id="goalInput"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              aria-label="How often per week"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                <option key={g} value={g}>
                  {goalLabel(g)}
                </option>
              ))}
            </select>
            <button type="submit" className="add" title="Add habit" aria-label="Add habit">
              Add
            </button>
          </form>
        </div>
      </div>

      <div className="scroll">
        <table id="grid">
          <thead>
            <tr>
              <th className="sub-heading">Habits</th>
              {Array.from({ length: weeks }, (_, w) => (
                <th key={w} className="wk wstart" colSpan={Math.min(7, cal.n - w * 7)}>
                  Week {w + 1}
                </th>
              ))}
            </tr>
            <tr>
              <th aria-hidden="true" />
              {days.map((d) => {
                const dayName = DAY_NAMES[new Date(cal.y, cal.m, d).getDay()];
                const wstart = d % 7 === 1 ? 'wstart' : '';
                const isToday = d === cal.today ? 'today' : '';
                return (
                  <th
                    key={d}
                    className={`${wstart} ${isToday}`.trim()}
                    title={dayName}
                    aria-label={`${dayName} ${d}`}
                  >
                    <span className="dn">{d}</span>
                    <span className="dw" aria-hidden="true">
                      {dayName[0]}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {habits.map((h) => (
              <tr key={h.id} style={{ '--c': h.color }}>
                <td className="name">
                  <span className="tag" title={h.name}>
                    {h.name}
                  </span>
                  {h.goal < 7 && <span className="goal">{h.goal}&times; / week</span>}
                </td>
                {days.map((d) => {
                  const key = dayKey(cal, d);
                  const cellKey = `${h.id}:${key}`;
                  const checked = Boolean(h.done[key]);
                  const isDisabled = d > cal.t;

                  return (
                    <td key={key} className={d % 7 === 1 ? 'wstart' : undefined}>
                      <span className="check-wrap">
                        <input
                          type="checkbox"
                          className={`check${burstCell === cellKey ? ' celebrate-pop' : ''}`}
                          checked={checked}
                          disabled={isDisabled}
                          onChange={(e) => handleCheckboxChange(h.id, key, e.target.checked)}
                          aria-label={`${h.name} ${key}`}
                        />
                        <CelebrationBurst active={burstCell === cellKey} color={h.color} />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}