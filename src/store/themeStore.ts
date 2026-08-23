import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ThemeMode } from "@/theme";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => set({ mode }),
      toggleTheme: () =>
        set((state) => ({ mode: state.mode === "dark" ? "light" : "dark" })),
    }),
    { name: "savesmart-theme", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
