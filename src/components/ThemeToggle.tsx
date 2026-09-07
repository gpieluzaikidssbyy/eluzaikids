'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  return stored === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const applyTheme = (next: Theme) => {
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    window.localStorage.setItem('theme', next);
  };

  const toggleTheme = () => applyTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, toggleTheme };
}
