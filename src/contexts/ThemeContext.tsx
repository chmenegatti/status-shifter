import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'custom';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  customPrimary: string;
  customAccent: string;
  setCustomPrimary: (color: string) => void;
  setCustomAccent: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '187 85% 43%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme-mode') as ThemeMode) || 'dark';
    }
    return 'dark';
  });
  
  const [customPrimary, setCustomPrimary] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom-primary') || '#00b8d4';
    }
    return '#00b8d4';
  });
  
  const [customAccent, setCustomAccent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom-accent') || '#e91e8c';
    }
    return '#e91e8c';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark', 'theme-custom');
    
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'custom') {
      root.classList.add('theme-custom');
      root.style.setProperty('--custom-primary', hexToHsl(customPrimary));
      root.style.setProperty('--custom-accent', hexToHsl(customAccent));
    }
    
    localStorage.setItem('theme-mode', mode);
  }, [mode, customPrimary, customAccent]);

  useEffect(() => {
    localStorage.setItem('custom-primary', customPrimary);
    localStorage.setItem('custom-accent', customAccent);
  }, [customPrimary, customAccent]);

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      setMode, 
      customPrimary, 
      customAccent,
      setCustomPrimary,
      setCustomAccent 
    }}>
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
