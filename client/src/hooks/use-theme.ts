import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';

// Helper function to get system preference
const getSystemPreference = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

// Helper to get theme from storage or system
const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const storedTheme = localStorage.getItem('theme') as Theme | null;
  return storedTheme || 'system';
};

// Apply theme to document
const applyTheme = (theme: Theme) => {
  const documentElement = document.documentElement;
  const isDark = theme === 'dark' || 
                (theme === 'system' && getSystemPreference() === 'dark');
  
  if (isDark) {
    documentElement.classList.add('dark');
  } else {
    documentElement.classList.remove('dark');
  }
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);

    // Listen for system preference changes if theme is set to "system"
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
}

export default useTheme;