import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
  primaryColor: null,
  setPrimaryColor: () => null,
});

import {
  analyzeContrast,
  generateHoverColor,
  generateGlowRgba,
  getContrastForeground as engineContrastForeground,
} from '../../utils/colorEngine.js';

export const getContrastForeground = engineContrastForeground;

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('avi_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  const [primaryColor, setPrimaryColorState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avi_primary_color') || null;
    }
    return null;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('avi_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (primaryColor) {
      const contrast = analyzeContrast(primaryColor);
      const hover = generateHoverColor(primaryColor);
      const glow = generateGlowRgba(primaryColor, 0.25);

      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--primary-hover', hover);
      root.style.setProperty('--primary-glow', glow);
      root.style.setProperty('--sidebar-primary', primaryColor);
      root.style.setProperty('--ring', primaryColor);
      root.style.setProperty('--primary-foreground', contrast.foreground);
      root.style.setProperty('--sidebar-primary-foreground', contrast.foreground);
      localStorage.setItem('avi_primary_color', primaryColor);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-hover');
      root.style.removeProperty('--primary-glow');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--sidebar-primary-foreground');
      localStorage.removeItem('avi_primary_color');
    }
  }, [primaryColor]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const setPrimaryColor = (color) => {
    setPrimaryColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
