import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";

export default function ThemeSwitch() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-md
        text-foreground-muted
        transition
        hover:bg-surface-soft
        hover:text-foreground
      "
      title="Toggle Theme"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
