import { COLORS, LEGACY_THEME_MAP, LIMITS, STORAGE_KEYS, THEMES, normGoal } from '../constants/config';
import { keyOf } from './date';

export function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked or full
  }
}

export function readJSON(key, isValid, fallback) {
  const raw = lsGet(key);
  if (raw === null) return fallback();
  try {
    const data = JSON.parse(raw);
    if (isValid(data)) return data;
  } catch {
    // Damaged JSON backed up below
  }
  lsSet(`${key}.backup`, raw);
  return fallback();
}

export function createHabit(name, color, goal = 7) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name,
    color,
    goal: normGoal(goal),
    start: keyOf(new Date()),
    done: {}
  };
}

const isHabit = (h) =>
  !!h &&
  typeof h.id === 'string' &&
  typeof h.name === 'string' &&
  typeof h.color === 'string' &&
  typeof h.start === 'string' &&
  !!h.done &&
  typeof h.done === 'object' &&
  !Array.isArray(h.done);

const isHabits = (d) => Array.isArray(d) && d.every(isHabit);

const defaultHabits = () =>
  ['Habit 1', 'Habit 2', 'Habit 3'].map((name, i) => createHabit(name, COLORS[i]));

export const loadHabits = () =>
  readJSON(STORAGE_KEYS.HABITS, isHabits, defaultHabits).map((h) => ({
    ...h,
    goal: normGoal(h.goal)
  }));

export const clampTarget = (v) => Math.min(LIMITS.TARGET_MAX, Math.max(1, v));

export function loadTarget() {
  const v = parseInt(lsGet(STORAGE_KEYS.TARGET), 10);
  return Number.isNaN(v) ? LIMITS.TARGET_DEFAULT : clampTarget(v);
}

export function loadTheme() {
  const raw = lsGet(STORAGE_KEYS.THEME);
  const mapped = LEGACY_THEME_MAP[raw] || raw;
  return mapped && Object.prototype.hasOwnProperty.call(THEMES, mapped) ? mapped : 'zestia';
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isTask = (t) =>
  !!t &&
  typeof t.id === 'string' &&
  typeof t.text === 'string' &&
  typeof t.color === 'string' &&
  typeof t.done === 'boolean';

const isTaskList = (a) => Array.isArray(a) && a.every(isTask);

const isTodoStore = (d) =>
  isTaskList(d) ||
  (!!d &&
    typeof d === 'object' &&
    !Array.isArray(d) &&
    Object.keys(d).every((k) => DATE_RE.test(k) && isTaskList(d[k])));

export function loadTodos() {
  const data = readJSON(STORAGE_KEYS.TODOS, isTodoStore, () => ({}));
  if (Array.isArray(data)) {
    const store = data.length ? { [keyOf(new Date())]: data } : {};
    lsSet(STORAGE_KEYS.TODOS, JSON.stringify(store));
    return store;
  }
  return data;
}