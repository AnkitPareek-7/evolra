import React, { useEffect, useMemo, useState } from 'react';
import { LIMITS } from '../constants/config';
import {
  buildConsistencyBars,
  buildMonthlyBars,
  buildTargetStreakBars
} from '../utils/habitStats';
import BarChart from './BarChart';
import WeeklyProgressCard from './WeeklyProgressCard';

export default function ChartsSection({ cal, habits, viewOffset, targetDays, onUpdateTarget }) {
  const [targetInput, setTargetInput] = useState(String(targetDays));

  useEffect(() => {
    setTargetInput(String(targetDays));
  }, [targetDays]);

  const monthlyGroups = useMemo(() => buildMonthlyBars(habits, cal), [habits, cal]);
  const consistencyGroups = useMemo(() => buildConsistencyBars(habits, cal), [habits, cal]);
  const targetGroups = useMemo(() => buildTargetStreakBars(habits, targetDays), [habits, targetDays]);

  const handleTargetApply = (e) => {
    e.preventDefault();
    const val = parseInt(targetInput, 10);
    if (Number.isNaN(val) || val < 1) {
      alert('Please enter a valid target (1 or more days).');
      return;
    }
    const clamped = Math.min(LIMITS.TARGET_MAX, Math.max(1, val));
    setTargetInput(String(clamped));
    onUpdateTarget(clamped);
  };

  return (
    <section className="charts">
      {/* Row 1: Weekly Progress & Monthly Progress side by side */}
      <WeeklyProgressCard cal={cal} habits={habits} viewOffset={viewOffset} />

      <div className="card">
        <h2>Monthly Progress</h2>
        <BarChart groups={monthlyGroups} resetKey={`month-${viewOffset}`} />
      </div>

      {/* Row 2: Consistency & Target Streak side by side */}
      <div className="card">
        <h2>Consistency</h2>
        <BarChart groups={consistencyGroups} resetKey={`consistency-${viewOffset}`} />
      </div>

      <div className="card">
        <h2>Your Target Streak</h2>
        <form className="target-controls" onSubmit={handleTargetApply}>
          <label htmlFor="targetInput">Set Target (days):</label>
          <input
            type="number"
            id="targetInput"
            min="1"
            max={LIMITS.TARGET_MAX}
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
          />
          <button type="submit" className="go-btn">
            Go
          </button>
        </form>
        <BarChart groups={targetGroups} resetKey={`target-${targetDays}`} />
      </div>
    </section>
  );
}