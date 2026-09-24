"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "system" | "light" | "dark";
const THEME_KEY = "muslima-stories:theme-mode";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readMode(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light" || saved === "system")
      return saved;
    const legacy = window.localStorage.getItem("muslima-stories:theme");
    return legacy === "dark" || legacy === "light" ? legacy : "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMode(readMode());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const nextTheme =
        mode === "system" ? (media.matches ? "dark" : "light") : mode;
      setResolvedTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch {
      // Theme changes still apply for this session when storage is unavailable.
    }
    return () => media.removeEventListener("change", applyTheme);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
