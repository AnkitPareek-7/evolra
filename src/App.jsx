import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COLORS, STORAGE_KEYS, colorFor } from './constants/config';
import { getCalendar } from './utils/date';
import {
  createHabit,
  loadHabits,
  loadTarget,
  loadTheme,
  loadTodos,
  lsSet
} from './utils/storage';
import { useMidnightRollover } from './hooks/useMidnightRollover';
import Header from './components/Header';
import HabitGrid from './components/HabitGrid';
import ChartsSection from './components/ChartsSection';
import TodoSection from './components/TodoSection';
import HabitDialog from './components/HabitDialog';
import Toast from './components/Toast';

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [habits, setHabits] = useState(loadHabits);
  const [targetDays, setTargetDays] = useState(loadTarget);
  const [todos, setTodos] = useState(loadTodos);

  const [viewOffset, setViewOffset] = useState(0);
  const [todoOffset, setTodoOffset] = useState(0);
  const [dialogState, setDialogState] = useState({ open: false, mode: 'rename' });
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showUndo = useCallback((message, undoFn) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, undo: undoFn });
    toastTimerRef.current = setTimeout(() => setToast(null), 8000);
  }, []);

  const hideToast = useCallback(() => {
    clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Apply theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    lsSet(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Cross-tab synchronization
  useEffect(() => {
    const onStorage = (e) => {
      if (
        e.key !== null &&
        e.key !== STORAGE_KEYS.HABITS &&
        e.key !== STORAGE_KEYS.TARGET &&
        e.key !== STORAGE_KEYS.TODOS &&
        e.key !== STORAGE_KEYS.THEME
      ) {
        return;
      }
      setHabits(loadHabits());
      setTargetDays(loadTarget());
      setTodos(loadTodos());
      setTheme(loadTheme());
      hideToast();
      setDialogState((prev) => ({ ...prev, open: false }));
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hideToast]);

  // Midnight rollover
  const handleRollover = useCallback(({ dayDelta, monthDelta }) => {
    setTodoOffset((prev) => (prev !== 0 ? prev - dayDelta : 0));
    setViewOffset((prev) => (prev !== 0 ? prev - monthDelta : 0));
  }, []);

  useMidnightRollover(handleRollover);

  // Habits rendered with active theme palette
  const shownHabits = useMemo(
    () => habits.map((h, i) => ({ ...h, color: colorFor(theme, h.color, i) })),
    [habits, theme]
  );

  const cal = getCalendar(viewOffset);

  /* ---------- Habit Actions ---------- */
  const updateHabits = (updater) => {
    setHabits((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      lsSet(STORAGE_KEYS.HABITS, JSON.stringify(next));
      return next;
    });
  };

  const handleToggleDay = (habitId, key, checked) => {
    updateHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const done = { ...h.done };
        let start = h.start;
        if (checked) {
          done[key] = true;
          if (key < start) start = key;
        } else {
          delete done[key];
        }
        return { ...h, start, done };
      })
    );
  };

  const handleAddHabit = (name, goal) => {
    updateHabits((prev) => {
      const color =
        COLORS.find((c) => !prev.some((h) => h.color === c)) ||
        COLORS[prev.length % COLORS.length];
      return [...prev, createHabit(name, color, goal)];
    });
  };

  const handleSaveEdit = (index, name, goal) => {
    updateHabits((prev) =>
      prev.map((h, i) => (i === index ? { ...h, name, goal } : h))
    );
  };

  const handleDeleteHabit = (index) => {
    const removed = habits[index];
    if (!removed) return;

    updateHabits((prev) => prev.filter((_, i) => i !== index));
    showUndo(`Deleted "${removed.name}"`, () => {
      updateHabits((prev) => {
        const next = prev.slice();
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
    });
  };

  const handleUpdateTarget = (days) => {
    setTargetDays(days);
    lsSet(STORAGE_KEYS.TARGET, String(days));
  };

  /* ---------- To-Do Actions ---------- */
  const updateTodos = (updater) => {
    setTodos((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      lsSet(STORAGE_KEYS.TODOS, JSON.stringify(next));
      return next;
    });
  };

  const handleAddTodo = (dateKey, text) => {
    updateTodos((prev) => {
      const list = prev[dateKey] ? prev[dateKey].slice() : [];
      const color = COLORS[list.length % COLORS.length];
      list.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        text,
        color,
        done: false
      });
      return { ...prev, [dateKey]: list };
    });
  };

  const handleToggleTodo = (dateKey, taskId, checked) => {
    updateTodos((prev) => {
      const list = (prev[dateKey] || []).map((t) =>
        t.id === taskId ? { ...t, done: checked } : t
      );
      return { ...prev, [dateKey]: list };
    });
  };

  const handleRemoveTodo = (dateKey, taskId) => {
    const list = todos[dateKey] || [];
    const index = list.findIndex((t) => t.id === taskId);
    if (index < 0) return;
    const removed = list[index];

    updateTodos((prev) => {
      const filtered = (prev[dateKey] || []).filter((t) => t.id !== taskId);
      const next = { ...prev };
      if (filtered.length > 0) next[dateKey] = filtered;
      else delete next[dateKey];
      return next;
    });

    showUndo(`Removed task "${removed.text}"`, () => {
      updateTodos((prev) => {
        const current = (prev[dateKey] || []).slice();
        current.splice(Math.min(index, current.length), 0, removed);
        return { ...prev, [dateKey]: current };
      });
    });
  };

  return (
    <>
      <div className="galaxy-stars" aria-hidden="true" />
      <main>
        <Header theme={theme} onChangeTheme={setTheme} />

        <HabitGrid
          cal={cal}
          habits={shownHabits}
          onPrevMonth={() => setViewOffset((v) => v - 1)}
          onNextMonth={() => setViewOffset((v) => v + 1)}
          onToggleDay={handleToggleDay}
          onAddHabit={handleAddHabit}
          onOpenDialog={(mode) => setDialogState({ open: true, mode })}
        />

        <ChartsSection
          cal={cal}
          habits={shownHabits}
          viewOffset={viewOffset}
          targetDays={targetDays}
          onUpdateTarget={handleUpdateTarget}
        />

        <TodoSection
          theme={theme}
          todos={todos}
          todoOffset={todoOffset}
          onPrevDay={() => setTodoOffset((v) => v - 1)}
          onNextDay={() => setTodoOffset((v) => (v < 0 ? v + 1 : 0))}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onRemoveTodo={handleRemoveTodo}
        />
      </main>

      <HabitDialog
        mode={dialogState.mode}
        isOpen={dialogState.open}
        habits={shownHabits}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        onSaveEdit={handleSaveEdit}
        onConfirmDelete={handleDeleteHabit}
      />

      <Toast
        toast={toast}
        onUndo={() => {
          const fn = toast?.undo;
          hideToast();
          fn?.();
        }}
      />
    </>
  );
}