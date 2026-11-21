import React, { useEffect, useRef, useState } from 'react';
import { fmtPct } from '../utils/habitStats';

export default function BarChart({ groups, resetKey }) {
  const prevValuesRef = useRef({});
  const lastResetKeyRef = useRef(resetKey);
  const [celebratingKeys, setCelebratingKeys] = useState(() => new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    const nextSnapshot = {};
    const increased = new Set();
    const sameContext = lastResetKeyRef.current === resetKey;

    groups.forEach((group, gIdx) => {
      group.bars.forEach((bar, bIdx) => {
        const key = `${gIdx}:${group.label}:${bIdx}`;
        nextSnapshot[key] = bar.v;
        if (sameContext && prevValuesRef.current[key] !== undefined && bar.v > prevValuesRef.current[key] + 0.01) {
          increased.add(key);
        }
      });
    });

    prevValuesRef.current = nextSnapshot;
    lastResetKeyRef.current = resetKey;

    if (increased.size > 0) {
      setCelebratingKeys(increased);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCelebratingKeys(new Set()), 950);
    }
  }, [groups, resetKey]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="chart">
      {groups.map((group, gIdx) => (
        <div key={`${group.label}-${gIdx}`} className="group">
          <div className="bars">
            {group.bars.map((bar, bIdx) => {
              const key = `${gIdx}:${group.label}:${bIdx}`;
              const isCelebrating = celebratingKeys.has(key);
              const isComplete = isCelebrating && bar.v >= 99.9;

              return (
                <div
                  key={bIdx}
                  className={`bar${isCelebrating ? ' bar-celebrate' : ''}${isComplete ? ' bar-complete' : ''}`}
                  style={{ height: `${bar.v}%`, background: bar.c, '--bar-c': bar.c }}
                  title={bar.t}
                >
                  <span>{fmtPct(bar.v)}</span>
                </div>
              );
            })}
          </div>
          <label title={group.label}>{group.label}</label>
        </div>
      ))}
    </div>
  );
}