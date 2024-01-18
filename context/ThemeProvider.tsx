"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("");

  const handleThemeChange = () => {
    if (mode === "dark") {
      setMode("light");
      document.documentElement.classList.add("light");
    } else {
      setMode("dark");
      document.documentElement.classList.add("dark");
    }
  };

  // Beim Start der App wird der Theme Mode aus dem Local Storage geholt und gesetzt
  //   useEffect(() => {
  //     handleThemeChange();
  //   }, [mode]);

  // Der Provider muss hier returned werden zusammen mit den State Werten, welche hier gesetzt wurden
  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
// Der Hook wird hier exportiert, damit er in anderen Dateien verwendet werden kann
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme has to be used within a ThemeProvider");
  }

  return context;
}
