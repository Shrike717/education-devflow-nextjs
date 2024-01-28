"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// const ThemeContext = createContext();

const ThemeContext = createContext<{
  mode: string;
  setMode: (value: string) => void;
}>({ mode: "", setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("");

  const handleThemeChange = () => {
    // So wird herausgefunden, ob der Computer des Users einen Theme Mode eingestellt hat. Wenn nicht, wird der Theme Mode vom Local Storage genommen.
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      // Ist das der Fall, wird der Theme Mode auf dark gesetzt und der CSS Class dark der Classlist des Browsers hinzugefügt
      setMode("dark");
      document.documentElement.classList.add("dark");
    } else {
      // Ist das nicht der Fall, wird der Theme Mode auf light gesetzt und die CSS Class dark von der Classlist des Browsers entfernt
      setMode("light");
      document.documentElement.classList.remove("dark");
    }
  };

  // Beim Start der App wird der Theme Mode aus dem Local Storage geholt und gesetzt
  useEffect(() => {
    handleThemeChange();
  }, [mode]);

  // Der Provider muss hier returned werden zusammen mit den State Werten, welche hier gesetzt wurden
  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
// Der Hook wird hier exportiert, damit er in anderen Dateien verwendet werden kann.
//  Wo kann von dort schnell auf das State mode zugegriffen werden
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme has to be used within a ThemeProvider");
  }

  return context;
}
