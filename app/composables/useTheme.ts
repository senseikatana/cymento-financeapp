export function useTheme() {
  const theme = useState<string>("theme", () => "light");

  const applyTheme = (t: string) => {
    theme.value = t;
    if (import.meta.client) {
      const root = document.documentElement;
      root.classList.toggle("dark", t === "dark");
      try {
        localStorage.setItem("theme", t);
      } catch {
        // ignore storage errors (private mode)
      }
    }
  };

  const toggleTheme = () => {
    applyTheme(theme.value === "dark" ? "light" : "dark");
  };

  // Initialize on client
  if (import.meta.client) {
    const saved =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("theme")
        : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  return { theme, toggleTheme, applyTheme };
}
