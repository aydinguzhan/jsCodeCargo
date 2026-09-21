import { FileCode, Folder, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useThemeStore } from "../../stores/themeStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

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
    id: "theme",
    title: "Toggle Theme",
    description: "Switch between light and dark theme",
    icon: Sun,
  },
];

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const rootPath = useWorkspaceStore((state) => state.rootPath);
  const rootName = useWorkspaceStore((state) => state.rootName);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const openFile = useEditorStore((state) => state.openFile);
  const openFileFromPath = useEditorStore((state) => state.openFileFromPath);

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(query.toLowerCase()),
  );
  const results: PaletteResult[] = [
    ...workspaceFiles.map((file) => ({ type: "file" as const, file })),
    ...filteredCommands.map((command) => ({ type: "command" as const, command })),
  ];

  const moveActiveResult = (direction: 1 | -1) => {
    if (results.length === 0) {
      return;
    }

    setActiveResultIndex(
      (currentIndex) =>
        (currentIndex + direction + results.length) % results.length,
    );
  };

  const runCommand = async (id: string) => {
    if (id === "open-file") {
      await openFile();
    } else if (id === "open-folder") {
      await openWorkspace();
    } else if (id === "theme") {
      useThemeStore.getState().toggleTheme();
    }
    onClose();
  };

  const openResult = (result: PaletteResult | undefined) => {
    if (!result) {
      return;
    }

    if (result.type === "file") {
      void openFileFromPath(result.file.path);
      onClose();
      return;
    }

    void runCommand(result.command.id);
  };

  useEffect(() => {
    if (!rootPath) {
      setWorkspaceFiles([]);
      return;
    }

    let current = true;
    void window.ipcRenderer
      .invoke("workspace:find-files", rootPath, query)
      .then((files: WorkspaceFile[]) => {
        if (current) {
          setWorkspaceFiles(files);
        }
      })
      .catch(() => current && setWorkspaceFiles([]));

    return () => {
      current = false;
    };
  }, [query, rootPath]);

  useEffect(() => {
    setActiveResultIndex(0);
  }, [query, workspaceFiles.length]);

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
              setActiveResultIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActiveResult(1);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActiveResult(-1);
              }

              if (event.key === "Enter") {
                event.preventDefault();
                openResult(results[activeResultIndex]);
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
          {workspaceFiles.length > 0 && (
            <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
              Files in {rootName}
            </p>
          )}

          {results.map((result, index) => {
            const isActive = index === activeResultIndex;
            const command = result.type === "command" ? result.command : undefined;
            const Icon = result.type === "command" ? result.command.icon : FileCode;
            const title = result.type === "command" ? result.command.title : result.file.name;
            const description = result.type === "command"
              ? result.command.description
              : result.file.relativePath;
            const key = result.type === "command" ? result.command.id : result.file.path;

            return (
              <button
                key={key}
                type="button"
                onClick={() => openResult(result)}
                onMouseEnter={() => setActiveResultIndex(index)}
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
                  <div className="text-sm text-foreground">{title}</div>

                  <div className="truncate text-xs text-foreground-muted">
                    {description}
                  </div>
                </div>

                {command?.shortcut && (
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

type WorkspaceFile = {
  name: string;
  path: string;
  relativePath: string;
};

type PaletteResult =
  | { type: "file"; file: WorkspaceFile }
  | { type: "command"; command: (typeof commands)[number] };

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
