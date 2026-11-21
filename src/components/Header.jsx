import React, { useEffect, useRef, useState } from 'react';
import { THEMES } from '../constants/config';

const themeKeys = Object.keys(THEMES);

export default function Header({ theme, onChangeTheme }) {
  const [ready, setReady] = useState(false);
  const switchRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleKeyDown = (e) => {
    const idx = themeKeys.indexOf(theme);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % themeKeys.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + themeKeys.length) % themeKeys.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = themeKeys.length - 1;

    if (next < 0) return;
    e.preventDefault();
    const nextTheme = themeKeys[next];
    onChangeTheme(nextTheme);
    const btn = switchRef.current?.querySelector(`[data-theme-id="${nextTheme}"]`);
    btn?.focus();
  };

  return (
    <header className="top-bar">
      <a
        className="github-icon"
        href="https://github.com/AnkitPareek-7"
        target="_blank"
        rel="noopener noreferrer"
        title="Follow AnkitPareek on GitHub"
        aria-label="Follow AnkitPareek on GitHub"
      >
        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>

      <h1 className="brand-title">Evolve</h1>

      <div className="theme-control">
        <span id="themeLabel" className="theme-label">Theme</span>
        <div
          ref={switchRef}
          className={`theme-switch${ready ? ' ready' : ''}`}
          role="radiogroup"
          aria-labelledby="themeLabel"
          style={{ '--n': themeKeys.length, '--i': themeKeys.indexOf(theme) }}
          onKeyDown={handleKeyDown}
        >
          <span className="theme-pill" aria-hidden="true" />
          {themeKeys.map((key) => {
            const active = key === theme;
            return (
              <button
                key={key}
                type="button"
                className={`theme-opt${active ? ' active' : ''}`}
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                data-theme-id={key}
                onClick={() => onChangeTheme(key)}
              >
                <i className="theme-dot" style={{ '--dot': THEMES[key].dot }} />
                {THEMES[key].label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}