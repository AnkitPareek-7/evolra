import React, { useEffect, useRef, useState } from 'react';
import { LIMITS, colorFor } from '../constants/config';
import { keyOf, todayDate } from '../utils/date';
import CelebrationBurst from './CelebrationBurst';

export default function TodoSection({
  theme,
  todos,
  todoOffset,
  onPrevDay,
  onNextDay,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo
}) {
  const [text, setText] = useState('');
  const [burstId, setBurstId] = useState(null);
  const [barCelebrate, setBarCelebrate] = useState(false);

  const prevPctRef = useRef(null);
  const prevOffsetRef = useRef(todoOffset);
  const burstTimerRef = useRef(null);
  const barTimerRef = useRef(null);

  const baseToday = todayDate();
  const viewedDate = new Date(
    baseToday.getFullYear(),
    baseToday.getMonth(),
    baseToday.getDate() + todoOffset
  );
  const dateKey = keyOf(viewedDate);
  const tasks = todos[dateKey] || [];
  const isToday = todoOffset === 0;

  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  useEffect(() => {
    const sameDay = prevOffsetRef.current === todoOffset;
    if (sameDay && prevPctRef.current !== null && percent > prevPctRef.current) {
      setBarCelebrate(true);
      clearTimeout(barTimerRef.current);
      barTimerRef.current = setTimeout(() => setBarCelebrate(false), 900);
    }
    prevPctRef.current = percent;
    prevOffsetRef.current = todoOffset;
  }, [percent, todoOffset]);

  useEffect(
    () => () => {
      clearTimeout(burstTimerRef.current);
      clearTimeout(barTimerRef.current);
    },
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTodo(dateKey, trimmed.slice(0, LIMITS.TODO_MAX));
    setText('');
  };

  const handleCheck = (taskId, checked) => {
    onToggleTodo(dateKey, taskId, checked);
    if (checked) {
      setBurstId(taskId);
      clearTimeout(burstTimerRef.current);
      burstTimerRef.current = setTimeout(() => setBurstId(null), 650);
    }
  };

  const dateLabel =
    viewedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + (isToday ? ' (Today)' : '');

  return (
    <section className="card todo-card">
      <h2>Daily To-Do List</h2>

      <div className="todo-nav">
        <button type="button" className="rename-btn" onClick={onPrevDay} title="Previous day">
          Prev
        </button>
        <span className="todo-date">{dateLabel}</span>
        <button type="button" className="rename-btn" onClick={onNextDay} disabled={isToday} title="Next day">
          Next
        </button>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          maxLength={LIMITS.TODO_MAX}
          aria-label="New task"
          required
        />
        <button type="submit" className="add" title="Add task" aria-label="Add task">
          Add
        </button>
      </form>

      {tasks.length > 0 && (
        <ul className="todo-list">
          {tasks.map((task, idx) => {
            const taskColor = colorFor(theme, task.color, idx);
            const isBursting = burstId === task.id;
            return (
              <li key={task.id} className="todo-item" style={{ '--tc': taskColor }}>
                <span className="check-wrap">
                  <input
                    type="checkbox"
                    className={`todo-check${isBursting ? ' celebrate-pop' : ''}`}
                    checked={task.done}
                    onChange={(e) => handleCheck(task.id, e.target.checked)}
                    aria-label={`Mark ${task.text}`}
                  />
                  <CelebrationBurst active={isBursting} color={taskColor} />
                </span>
                <span className={`todo-text${task.done ? ' done' : ''}`}>{task.text}</span>
                <button
                  type="button"
                  className="todo-delete"
                  onClick={() => onRemoveTodo(dateKey, task.id)}
                  aria-label={`Remove task: ${task.text}`}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="todo-progress">
        {tasks.length === 0 ? (
          <p className="todo-progress-info">
            {isToday ? 'No tasks yet. Add one above.' : 'No tasks on this day.'}
          </p>
        ) : (
          <>
            <p className="todo-progress-info">
              {doneCount} of {total} completed ({percent}%)
            </p>
            <div className="todo-bar-track">
              <div
                className={`todo-bar-fill${barCelebrate ? ' fill-celebrate' : ''}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}