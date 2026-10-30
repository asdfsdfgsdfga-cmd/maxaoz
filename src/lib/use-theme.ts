// EXPORTS: useTheme
import { useEffect, useState, useCallback } from "react";
import { store } from "@/lib/storage";

export type Theme = "light" | "dark";

const THEME_KEY = "app:theme";

function applyClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = store.get<Theme | null>(THEME_KEY, null);
    // default dark
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    applyClass(theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    store.set(THEME_KEY, t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      store.set(THEME_KEY, next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
