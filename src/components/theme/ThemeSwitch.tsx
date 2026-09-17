import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function ThemeSwitch() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const nextTheme = !isDark;

    setIsDark(nextTheme);

    document.documentElement.classList.toggle("dark", nextTheme);
  };

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
