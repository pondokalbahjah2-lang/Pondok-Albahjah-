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
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('app-theme') as ThemeMode;
        if (saved) return saved;
      }
    } catch (e) {
      console.warn('Storage read disabled or restricted:', e);
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('app-theme', theme);
      }
    } catch (e) {
      console.warn('Storage write restricted:', e);
    }

    let intervalId: any;

    if (theme === 'system') {
      try {
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          if (mediaQuery) {
            setIsDarkMode(Boolean(mediaQuery.matches));

            const handler = (e: MediaQueryListEvent) => {
              setIsDarkMode(Boolean(e.matches));
            };
            
            if (mediaQuery.addEventListener) {
              mediaQuery.addEventListener('change', handler);
              return () => mediaQuery.removeEventListener('change', handler);
            } else if ((mediaQuery as any).addListener) {
              (mediaQuery as any).addListener(handler);
              return () => (mediaQuery as any).removeListener(handler);
            }
          }
        }
      } catch (mmErr) {
        console.warn('matchMedia check error:', mmErr);
      }
    } else if (theme === 'auto-sun') {
      // Check sunrise/sunset
      const checkSun = () => {
        try {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              try {
                const times = SunCalc.getTimes(new Date(), position.coords.latitude, position.coords.longitude);
                const now = new Date();
                if (now < times.sunrise || now > times.sunset) {
                  setIsDarkMode(true);
                } else {
                  setIsDarkMode(false);
                }
              } catch (scErr) {
                console.warn('SunCalc error:', scErr);
              }
            }, (err) => {
              console.warn("Geolocation denied/failed. Defaulting to system for auto-sun.", err);
              if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
                const mm = window.matchMedia('(prefers-color-scheme: dark)');
                setIsDarkMode(Boolean(mm?.matches));
              }
            });
          }
        } catch (geoErr) {
          console.warn('Geolocation error:', geoErr);
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
    try {
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.warn('DOM theme class toggle error:', e);
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
