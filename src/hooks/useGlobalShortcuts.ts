import { useEffect } from "react";
import { type Shortcut, type ShortcutId, useShortcutStore } from "../stores/shortcutStore";
import { useEditorStore } from "../stores/editorStore";
import { useUiStore } from "../stores/uiStore";

function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut) {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    event.metaKey === Boolean(shortcut.meta) &&
    event.ctrlKey === Boolean(shortcut.ctrl) &&
    event.shiftKey === Boolean(shortcut.shift) &&
    event.altKey === Boolean(shortcut.alt)
  );
}

function runShortcut(id: ShortcutId) {
  const ui = useUiStore.getState();

  switch (id) {
    case "toggleTerminal":
      ui.toggleTerminal();
      return true;
    case "commandPalette":
      ui.toggleCommandPalette();
      return true;
    case "newFile":
      useEditorStore.getState().createNewFile();
      return true;
    case "closeTab":
      {
        const editor = useEditorStore.getState();
        if (!editor.activeTabId) {
          return false;
        }

        editor.closeActiveTab();
      }
      return true;
    default:
      // Dosya işlemleri editor/workspace store eklendiğinde burada bağlanacak.
      return false;
  }
}

export function useGlobalShortcuts() {
  const shortcuts = useShortcutStore((state) => state.shortcuts);
  const enabledShortcuts = useShortcutStore((state) => state.enabledShortcuts);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = (Object.keys(shortcuts) as ShortcutId[]).find(
        (id) => enabledShortcuts[id] && matchesShortcut(event, shortcuts[id]),
      );

      if (!matchedShortcut) {
        return;
      }

      if (runShortcut(matchedShortcut)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabledShortcuts, shortcuts]);
}
