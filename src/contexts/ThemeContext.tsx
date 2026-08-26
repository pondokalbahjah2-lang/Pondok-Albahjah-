import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SunCalc from 'suncalc';

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto-sun';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-theme') as ThemeMode;
    return saved || 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);

    let intervalId: NodeJS.Timeout;

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.addListener(handler);
        return () => mediaQuery.removeListener(handler);
      }
    } else if (theme === 'auto-sun') {
      // Check sunrise/sunset
      const checkSun = () => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            const times = SunCalc.getTimes(new Date(), position.coords.latitude, position.coords.longitude);
            const now = new Date();
            // It is dark if current time is before sunrise or after sunset
            if (now < times.sunrise || now > times.sunset) {
              setIsDarkMode(true);
            } else {
              setIsDarkMode(false);
            }
          }, (err) => {
            console.warn("Geolocation denied/failed. Defaulting to system for auto-sun.", err);
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
          });
        }
      };
      
      checkSun();
      // Recheck every 5 minutes
      intervalId = setInterval(checkSun, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
