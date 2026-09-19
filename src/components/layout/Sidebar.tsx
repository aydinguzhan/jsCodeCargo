import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import {
  type WorkspaceEntry,
  useWorkspaceStore,
} from "../../stores/workspaceStore";
import { useEditorStore } from "../../stores/editorStore";

export default function Sidebar() {
  const rootName = useWorkspaceStore((state) => state.rootName);
  const entries = useWorkspaceStore((state) => state.entries);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const openFileFromPath = useEditorStore((state) => state.openFileFromPath);

  return (
    <aside
      className="
        hidden
        w-64
        shrink-0
        border-r
        border-border
        bg-surface
        md:block
      "
    >
      <div className="border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase text-foreground-muted">
          Explorer
        </span>
      </div>

      {rootName ? (
        <div className="py-2">
          <div className="truncate px-3 pb-2 text-xs font-semibold text-foreground">
            {rootName}
          </div>
          {entries.length === 0 ? (
            <p className="px-3 text-xs text-foreground-muted">Folder is empty</p>
          ) : (
            <FileTree entries={entries} depth={0} onOpenFile={openFileFromPath} />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
          <FolderOpen size={28} className="text-foreground-muted" />
          <p className="text-sm text-foreground-muted">No folder opened</p>
          <button
            type="button"
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-110"
            onClick={() => void openWorkspace()}
          >
            Open Folder
          </button>
        </div>
      )}
    </aside>
  );
}

function FileTree({
  entries,
  depth,
  onOpenFile,
}: {
  entries: WorkspaceEntry[];
  depth: number;
  onOpenFile: (filePath: string) => Promise<boolean>;
}) {
  return (
    <ul>
      {entries.map((entry) => (
        <FileTreeEntry
          key={entry.path}
          entry={entry}
          depth={depth}
          onOpenFile={onOpenFile}
        />
      ))}
    </ul>
  );
}

function FileTreeEntry({
  entry,
  depth,
  onOpenFile,
}: {
  entry: WorkspaceEntry;
  depth: number;
  onOpenFile: (filePath: string) => Promise<boolean>;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = useWorkspaceStore((state) => state.childrenByPath[entry.path]);
  const isLoading = useWorkspaceStore((state) => state.loadingPaths[entry.path]);
  const loadDirectory = useWorkspaceStore((state) => state.loadDirectory);

  const toggleDirectory = () => {
    if (!entry.isDirectory) {
      void onOpenFile(entry.path);
      return;
    }

    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      void loadDirectory(entry.path);
    }
  };

  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-1.5 py-1 pr-3 text-left text-xs text-foreground-muted transition hover:bg-surface-soft hover:text-foreground"
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        onClick={toggleDirectory}
      >
        {entry.isDirectory ? (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <span className="w-3.5" />
        )}
        {entry.isDirectory ? (
          <Folder size={15} className="shrink-0 text-accent" />
        ) : (
          <File size={15} className="shrink-0" />
        )}
        <span className="truncate">{entry.name}</span>
      </button>

      {entry.isDirectory && expanded && (
        isLoading ? (
          <p className="py-1 text-xs text-foreground-muted" style={{ paddingLeft: `${40 + depth * 14}px` }}>
            Loading...
          </p>
        ) : children?.length ? (
          <FileTree
            entries={children}
            depth={depth + 1}
            onOpenFile={onOpenFile}
          />
        ) : children ? (
          <p className="py-1 text-xs text-foreground-muted" style={{ paddingLeft: `${40 + depth * 14}px` }}>
            Empty folder
          </p>
        ) : null
      )}
    </li>
  );
}
