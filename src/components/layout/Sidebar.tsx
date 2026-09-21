import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type WorkspaceEntry,
  useWorkspaceStore,
} from "../../stores/workspaceStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUiStore } from "../../stores/uiStore";
import GitSidebar from "../git/GitSidebar";

export default function Sidebar() {
  const rootName = useWorkspaceStore((state) => state.rootName);
  const entries = useWorkspaceStore((state) => state.entries);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const openFileFromPath = useEditorStore((state) => state.openFileFromPath);
  const sidebarView = useUiStore((state) => state.sidebarView);

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
      {sidebarView === "git" ? (
        <GitSidebar />
      ) : sidebarView === "search" ? (
        <WorkspaceSearch onOpenFile={openFileFromPath} />
      ) : (
        <>
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase text-foreground-muted">
          Explorer
        </span>
        <button
          type="button"
          onClick={() => void openWorkspace()}
          className="rounded px-1.5 py-0.5 text-[11px] font-medium text-foreground-muted transition hover:bg-surface-soft hover:text-foreground"
          title="Open Folder"
        >
          Open Folder
        </button>
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
        </>
      )}
    </aside>
  );
}

type SearchMatch = {
  path: string;
  relativePath: string;
  line: number;
  preview: string;
};

function WorkspaceSearch({
  onOpenFile,
}: {
  onOpenFile: (filePath: string) => Promise<boolean>;
}) {
  const rootPath = useWorkspaceStore((state) => state.rootPath);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!rootPath || !query.trim()) {
      setMatches([]);
      setSearching(false);
      return;
    }

    let current = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      void window.ipcRenderer
        .invoke("workspace:search-text", rootPath, query)
        .then((results: SearchMatch[]) => {
          if (current) {
            setMatches(results);
          }
        })
        .catch(() => current && setMatches([]))
        .finally(() => current && setSearching(false));
    }, 180);

    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [query, rootPath]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-3 py-2">
        <div className="mb-2 text-xs font-semibold uppercase text-foreground-muted">Search</div>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search in files"
          className="h-8 w-full rounded border border-input-border bg-input px-2 text-xs text-foreground outline-none placeholder:text-foreground-muted focus:border-primary"
        />
      </div>

      {!rootPath ? (
        <p className="px-3 py-4 text-xs text-foreground-muted">Open a folder to search its files.</p>
      ) : !query.trim() ? (
        <p className="px-3 py-4 text-xs text-foreground-muted">Type to search across the workspace.</p>
      ) : searching ? (
        <p className="px-3 py-4 text-xs text-foreground-muted">Searching…</p>
      ) : matches.length === 0 ? (
        <p className="px-3 py-4 text-xs text-foreground-muted">No results found.</p>
      ) : (
        <ul className="min-h-0 overflow-y-auto py-1">
          {matches.map((match) => (
            <li key={`${match.path}:${match.line}`}>
              <button
                type="button"
                onClick={() => void onOpenFile(match.path)}
                className="w-full px-3 py-2 text-left transition hover:bg-surface-soft"
              >
                <div className="truncate text-xs font-medium text-foreground">{match.relativePath}</div>
                <div className="truncate text-xs text-foreground-muted">
                  <span className="mr-1 text-accent">{match.line}:</span>{match.preview}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
