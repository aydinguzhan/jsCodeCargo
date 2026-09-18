import { FileCode, Folder, Settings, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

interface CommandPaletteProps {
  onClose: () => void;
}

const commands = [
  {
    id: "open-file",
    title: "Open File",
    description: "Open a file from the workspace",
    icon: FileCode,
    shortcut: "⌘ O",
  },
  {
    id: "open-folder",
    title: "Open Folder",
    description: "Open a workspace folder",
    icon: Folder,
    shortcut: "⌘ K O",
  },
  {
    id: "settings",
    title: "Open Settings",
    description: "Configure editor settings",
    icon: Settings,
  },
  {
    id: "theme",
    title: "Toggle Theme",
    description: "Switch between light and dark theme",
    icon: Sun,
  },
];

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(query.toLowerCase()),
  );

  const moveActiveCommand = (direction: 1 | -1) => {
    if (filteredCommands.length === 0) {
      return;
    }

    setActiveCommandIndex(
      (currentIndex) =>
        (currentIndex + direction + filteredCommands.length) %
        filteredCommands.length,
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <div
        className="
          fixed
          inset-0
          z-40
          bg-black/20
          backdrop-blur-[1px]
        "
        onClick={onClose}
      />

      <div
        className="
          absolute
          left-1/2
          top-12
          z-50
          w-[min(640px,calc(100vw-32px))]
          -translate-x-1/2
          overflow-hidden
          rounded-lg
          border
          border-border
          bg-surface
          shadow-2xl
        "
      >
        <div className="flex items-center border-b border-border px-3">
          <SearchIcon />

          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveCommandIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActiveCommand(1);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActiveCommand(-1);
              }
            }}
            placeholder="Search files, commands..."
            className="
              h-12
              min-w-0
              flex-1
              bg-transparent
              px-3
              text-sm
              text-foreground
              outline-none
              placeholder:text-foreground-muted
            "
          />

          <button
            onClick={onClose}
            className="
              rounded
              p-1
              text-foreground-muted
              hover:bg-surface-soft
              hover:text-foreground
            "
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.map((command, index) => {
            const Icon = command.icon;
            const isActive = index === activeCommandIndex;

            return (
              <button
                key={command.id}
                type="button"
                onMouseEnter={() => setActiveCommandIndex(index)}
                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-md
                  px-3
                  py-2.5
                  text-left
                  transition
                  hover:bg-surface-soft
                  focus:outline-none
                  ${isActive ? "bg-surface-soft" : ""}
                `}
                aria-current={isActive || undefined}
              >
                <Icon size={17} className="shrink-0 text-foreground-muted" />

                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground">{command.title}</div>

                  <div className="truncate text-xs text-foreground-muted">
                    {command.description}
                  </div>
                </div>

                {command.shortcut && (
                  <kbd
                    className="
                      rounded
                      border
                      border-border
                      bg-background
                      px-1.5
                      py-0.5
                      text-[10px]
                      text-foreground-muted
                    "
                  >
                    {command.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-foreground-muted"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
