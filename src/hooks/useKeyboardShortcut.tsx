import { useEffect } from "react";

interface ShortcutOptions {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  ctrl?: boolean;
}

export function useKeyboardShortcut(
  shortcut: ShortcutOptions,
  callback: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const metaPressed = event.metaKey;
      const ctrlPressed = event.ctrlKey;

      if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
        return;
      }

      if (shortcut.meta && !metaPressed) {
        return;
      }

      if (shortcut.ctrl && !ctrlPressed) {
        return;
      }

      if (shortcut.shift && !event.shiftKey) {
        return;
      }

      if (shortcut.alt && !event.altKey) {
        return;
      }

      event.preventDefault();

      callback();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcut, callback]);
}
