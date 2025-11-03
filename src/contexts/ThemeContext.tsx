import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'black-red' | 'navy' | 'light' | 'purple' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  'black-red': {
    name: 'Black & Red',
    description: 'Boss mode - Bold and striking',
    class: 'theme-black-red',
  },
  navy: {
    name: 'Professional Navy',
    description: 'Corporate and trustworthy',
    class: 'theme-navy',
  },
  light: {
    name: 'Minimal Light',
    description: 'Clean and white',
    class: 'theme-light',
  },
  purple: {
    name: 'Vibrant Purple',
    description: 'Modern and energetic',
    class: 'theme-purple',
  },
  'high-contrast': {
    name: 'High Contrast',
    description: 'Yellow/Black for accessibility',
    class: 'theme-high-contrast',
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('app-theme');
    return (stored as ThemeMode) || 'black-red';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.values(themes).forEach(t => {
      root.classList.remove(t.class);
    });
    
    // Add current theme class
    root.classList.add(themes[theme].class);
    
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
