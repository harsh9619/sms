import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ThemeName, ThemeMode } from "../types";
import { useSchool } from "./SchoolContext";

interface ThemeContextType {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { activeSchool } = useSchool();
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem("sms_theme") as ThemeName) || "default";
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("sms_mode") as ThemeMode) || "light";
  });

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("sms_theme", t);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("sms_mode", m);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  // Sync theme when active school changes
  useEffect(() => {
    if (activeSchool && activeSchool.theme) {
      setThemeState(activeSchool.theme as ThemeName);
    }
  }, [activeSchool]);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("theme-emerald", "theme-purple", "theme-rose", "theme-amber", "dark");
    // Add theme class
    if (theme !== "default") {
      root.classList.add(`theme-${theme}`);
    }
    // Add mode class
    if (mode === "dark") {
      root.classList.add("dark");
    }
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
