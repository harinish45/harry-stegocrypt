import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'aurora' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  aurora: {
    name: 'Glass Aurora',
    description: 'Deep midnight with violet + mint glow',
    class: '',
  },
  light: {
    name: 'Aurora Light',
    description: 'Soft paper with aurora accents',
    class: 'theme-light',
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('app-theme');
    if (stored === 'aurora' || stored === 'light') return stored;
    return 'aurora';
  });

  useEffect(() => {
    const root = document.documentElement;
    Object.values(themes).forEach(t => {
      if (t.class) root.classList.remove(t.class);
    });
    if (themes[theme].class) root.classList.add(themes[theme].class);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => setThemeState(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
