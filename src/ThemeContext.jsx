import React, { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('whystudy-theme') || 'light');
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem('whystudy-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
