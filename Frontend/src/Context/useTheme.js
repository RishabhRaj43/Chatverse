import { create } from "zustand";

const useTheme = create((set, get) => ({
  theme: localStorage.getItem("theme") || "light",
  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    set({ theme: newTheme });
  },
}));

export default useTheme;
