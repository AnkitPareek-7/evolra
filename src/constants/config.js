export const STORAGE_KEYS = {
  HABITS: 'evolve.v1',
  TARGET: 'evolve.target',
  TODOS: 'evolve.todos',
  THEME: 'evolve.theme'
};

export const THEMES = {
  zestia: { label: 'Zestia', dot: '#00ffc8' },
  azura: { label: 'Azura', dot: '#00B4D8' },
  galaxier: { label: 'Galaxier', dot: '#ff9ebb' }
};

export const LEGACY_THEME_MAP = {
  default: 'zestia',
  light: 'azura',
  purple: 'galaxier'
};

// Themes listed here color habits/tasks sequentially from their palette; Zestia uses saved habit colors.
export const THEME_PALETTES = {
  azura: ['#CAF0F8', '#90E0EF', '#00B4D8', '#0077B6', '#03045E'],
  galaxier: ['#ffd6a5', '#ff9ebb', '#e0aaff', '#9d4edd', '#72efdd']
};

export const COLORS = ['#00ffc8', '#03e7f7', '#b4ff00', '#62ff00', '#dcf905'];

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const LIMITS = {
  NAME_MAX: 30,
  TARGET_DEFAULT: 21,
  TARGET_MAX: 365,
  TODO_MAX: 50
};

export const colorFor = (theme, savedColor, index) => {
  const palette = THEME_PALETTES[theme];
  return palette ? palette[index % palette.length] : savedColor;
};

export const normGoal = (g) => (Number.isInteger(g) && g >= 1 && g <= 7 ? g : 7);

export const goalLabel = (g) => (g === 7 ? 'Every day (regular)' : `${g}\u00d7 a week`);