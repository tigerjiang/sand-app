import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 从存储中加载主题设置
    AsyncStorage.getItem("themeMode").then((savedMode) => {
      if (savedMode && (savedMode === "light" || savedMode === "dark" || savedMode === "auto")) {
        setThemeModeState(savedMode as ThemeMode);
      }
    });
  }, []);

  useEffect(() => {
    // 根据 themeMode 和系统设置确定当前主题
    if (themeMode === "auto") {
      setTheme(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem("themeMode", mode);
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
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

