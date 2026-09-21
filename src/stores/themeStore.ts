import { create } from "zustand";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "jscargocode.theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage erişimi engellendiğinde tema yalnızca mevcut oturumda kalır.
  }

  if ("ipcRenderer" in window) {
    void window.ipcRenderer.invoke("settings:theme:set", theme).catch(() => {
      // Electron ayar dosyası erişilemezse localStorage yedek olmaya devam eder.
    });
  }
}

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    persistTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      persistTheme(theme);
      return { theme };
    }),
}));

export async function initializeTheme() {
  let theme = useThemeStore.getState().theme;
  if ("ipcRenderer" in window) {
    try {
      const savedTheme = await window.ipcRenderer.invoke("settings:theme:get");
      if (savedTheme === "light" || savedTheme === "dark") {
        theme = savedTheme;
        useThemeStore.setState({ theme });
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
    } catch {
      // localStorage'daki tema ile devam edilir.
    }
  }
  applyTheme(theme);
}
