import { Files, Search, GitBranch, Settings } from "lucide-react";
import { useEffect } from "react";
import { useUiStore } from "../../stores/uiStore";
import { useGitStore } from "../../stores/gitStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export default function ActivityBar() {
  const sidebarView = useUiStore((state) => state.sidebarView);
  const setSidebarView = useUiStore((state) => state.setSidebarView);
  const changeCount = useGitStore((state) => state.changeCount);
  const setChangeCount = useGitStore((state) => state.setChangeCount);
  const rootPath = useWorkspaceStore((state) => state.rootPath);

  useEffect(() => {
    if (!rootPath) {
      setChangeCount(0);
      return;
    }

    let active = true;
    const refreshChangeCount = async () => {
      try {
        await window.ipcRenderer.invoke("workspace:restore-root", rootPath);
        const overview = await window.ipcRenderer.invoke("git:overview") as {
          isRepository: boolean;
          changes: unknown[];
        };
        if (active) {
          setChangeCount(overview.isRepository ? overview.changes.length : 0);
        }
      } catch {
        if (active) setChangeCount(0);
      }
    };

    void refreshChangeCount();
    const intervalId = window.setInterval(() => void refreshChangeCount(), 2000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [rootPath, setChangeCount]);

  return (
    <aside
      className="
        flex
        w-12
        shrink-0
        flex-col
        items-center
        justify-between
        border-r
        border-border
        bg-surface
        py-2
      "
    >
      <div className="flex flex-col gap-2">
        <IconButton
          icon={<Files size={19} />}
          label="Explorer"
          active={sidebarView === "explorer"}
          onClick={() => setSidebarView("explorer")}
        />
        <IconButton
          icon={<Search size={19} />}
          label="Search"
          active={sidebarView === "search"}
          onClick={() => setSidebarView("search")}
        />
        <IconButton
          icon={<GitBranch size={19} />}
          label="Source Control"
          active={sidebarView === "git"}
          onClick={() => setSidebarView("git")}
          badge={changeCount}
        />
      </div>

      <IconButton icon={<Settings size={19} />} label="Settings" />
    </aside>
  );
}

function IconButton({
  icon,
  label,
  active = false,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={`
        flex
        relative
        h-9
        w-9
        items-center
        justify-center
        rounded-md
        text-foreground-muted
        transition
        hover:bg-surface-soft
        hover:text-foreground
        ${active ? "bg-surface-soft text-foreground" : ""}
      `}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -bottom-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-surface bg-accent px-1 text-[9px] font-bold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
