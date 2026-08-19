"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "sang" | "toi";

const KHOA_LUU_THEME = "congtac-theme";

interface ThemeContextValue {
  theme: Theme;
  datTheme: (theme: Theme) => void;
  doiTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function apDungClassTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "toi");
}

/**
 * Quan ly theme sang/toi - ghi nho lua chon vao localStorage theo dung yeu
 * cau docs/QUY_TAC_GIAO_DIEN.md. Doc gia tri luu tren trinh duyet ngay khi
 * mount (client-only), truoc do mac dinh "sang" nen co the nhap nhay rat
 * ngan neu nguoi dung dang dat theme toi - chap nhan duoc voi quy mo app
 * noi bo nay.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("sang");

  useEffect(() => {
    const daLuu = window.localStorage.getItem(KHOA_LUU_THEME);
    const theoHeThong = window.matchMedia("(prefers-color-scheme: dark)").matches ? "toi" : "sang";
    const theoDung: Theme = daLuu === "sang" || daLuu === "toi" ? daLuu : theoHeThong;
    setThemeState(theoDung);
    apDungClassTheme(theoDung);
  }, []);

  function datTheme(theme: Theme) {
    setThemeState(theme);
    apDungClassTheme(theme);
    window.localStorage.setItem(KHOA_LUU_THEME, theme);
  }

  function doiTheme() {
    datTheme(theme === "sang" ? "toi" : "sang");
  }

  return <ThemeContext.Provider value={{ theme, datTheme, doiTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme phai dung ben trong ThemeProvider");
  return ctx;
}
