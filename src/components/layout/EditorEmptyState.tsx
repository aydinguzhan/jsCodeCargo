import { FilePlus2, FolderOpen } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { type Shortcut, useShortcutStore } from "../../stores/shortcutStore";

function formatShortcut(shortcut: Shortcut) {
  const modifiers = [
    shortcut.ctrl && "Ctrl",
    shortcut.alt && "⌥",
    shortcut.shift && "⇧",
    shortcut.meta && "⌘",
  ].filter(Boolean);

  return [...modifiers, shortcut.key.toUpperCase()].join(" ");
}

export default function EditorEmptyState() {
  const shortcuts = useShortcutStore((state) => state.shortcuts);
  const createNewFile = useEditorStore((state) => state.createNewFile);

  return (
    <section className="flex h-full items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-soft p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FilePlus2 size={20} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              No file opened
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">
              Create a new file or open one from your workspace.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={createNewFile}
            className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-3 text-left transition hover:bg-surface hover:cursor-pointer"
          >
            <FilePlus2 size={17} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                New File
              </span>
              <span className="block text-xs text-foreground-muted">
                Start with an empty editor tab
              </span>
            </span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground-muted">
              {formatShortcut(shortcuts.newFile)}
            </kbd>
          </button>

          <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-3">
            <FolderOpen size={17} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                Open File
              </span>
              <span className="block text-xs text-foreground-muted">
                Open a file from your workspace
              </span>
            </span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground-muted">
              {formatShortcut(shortcuts.openFile)}
            </kbd>
          </div>
        </div>
      </div>
    </section>
  );
}
