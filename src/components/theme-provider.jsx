import { createContext, useContext, useEffect, useMemo } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = "light";

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {},
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
