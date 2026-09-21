import { Check, CloudUpload, GitBranch, GitCommitHorizontal, Minus, Plus, RefreshCw, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useGitStore } from "../../stores/gitStore";
import { useToastStore } from "../../stores/toastStore";

type Change = { path: string; status: string; staged: boolean };
type Commit = { hash: string; author: string; date: string; message: string; decorations: string };
type Overview = { isRepository: boolean; branch: string | null; changes: Change[]; commits: Commit[]; ahead: number; behind: number; canPush: boolean; hasUpstream: boolean };

const emptyOverview: Overview = { isRepository: false, branch: null, changes: [], commits: [], ahead: 0, behind: 0, canPush: false, hasUpstream: false };
const MIN_LOADING_DURATION = 650;

function waitForMinimumDuration(startedAt: number) {
  const remaining = MIN_LOADING_DURATION - (Date.now() - startedAt);
  return remaining > 0 ? new Promise<void>((resolve) => window.setTimeout(resolve, remaining)) : Promise.resolve();
}

export default function GitSidebar() {
  const rootPath = useWorkspaceStore((state) => state.rootPath);
  const [overview, setOverview] = useState<Overview>(emptyOverview);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [workingAction, setWorkingAction] = useState<string | null>(null);
  const [historyRefreshing, setHistoryRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshGraph = useGitStore((state) => state.refreshHistory);
  const setChangeCount = useGitStore((state) => state.setChangeCount);
  const showToast = useToastStore((state) => state.showToast);

  const refresh = useCallback(async () => {
    if (!rootPath) { setOverview(emptyOverview); setChangeCount(0); return; }
    await window.ipcRenderer.invoke("workspace:restore-root", rootPath);
    const next = await window.ipcRenderer.invoke("git:overview") as Overview;
    setOverview(next);
    setChangeCount(next.isRepository ? next.changes.length : 0);
  }, [rootPath, setChangeCount]);

  useEffect(() => { void refresh(); }, [refresh]);

  const refreshHistory = async () => {
    const startedAt = Date.now();
    setHistoryRefreshing(true);
    try {
      await refresh();
      refreshGraph();
      showToast("Git history updated");
    } catch {
      showToast("Could not refresh Git history", "error");
    } finally {
      await waitForMinimumDuration(startedAt);
      setHistoryRefreshing(false);
    }
  };

  const perform = async (channel: string, ...args: unknown[]) => {
    const startedAt = Date.now();
    setWorking(true); setError(null);
    setWorkingAction(channel);
    try {
      const result = await window.ipcRenderer.invoke(channel, ...args) as { success: boolean; error?: string };
      if (!result.success) {
        const message = result.error ?? "Git operation failed";
        setError(message);
        showToast(message, "error");
      } else {
        if (channel === "git:commit") setMessage("");
        await refresh();
        refreshGraph();
        const messages: Record<string, string> = {
          "git:stage-all": "All changes staged",
          "git:stage-file": "File staged",
          "git:unstage-file": "File unstaged",
          "git:commit": "Commit created",
          "git:push": "Push completed successfully",
        };
        showToast(messages[channel] ?? "Git operation completed");
      }
    } finally {
      await waitForMinimumDuration(startedAt);
      setWorking(false);
      setWorkingAction(null);
    }
  };

  if (!rootPath) return <EmptyState text="Open a folder to use source control." />;
  if (!overview.isRepository) return <EmptyState text="This folder is not a Git repository." />;

  const staged = overview.changes.filter((change) => change.staged);
  const unstaged = overview.changes.filter((change) => !change.staged);
  return <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-center justify-between border-b border-border px-3 py-2">
      <span className="text-xs font-semibold uppercase text-foreground-muted">Source Control</span>
      <button type="button" disabled={historyRefreshing} title="Refresh Git status and history" onClick={() => void refreshHistory()} className="rounded p-1 text-foreground-muted hover:bg-surface-soft hover:text-foreground disabled:opacity-50"><RefreshCw size={15} className={historyRefreshing ? "animate-spin" : ""} /></button>
    </div>
    <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-foreground"><GitBranch size={15} className="text-accent" />{overview.branch}<span className="ml-auto text-foreground-muted">↑{overview.ahead} ↓{overview.behind}</span></div>
    <div className="border-b border-border p-3">
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Commit message" rows={2} className="w-full resize-none rounded border border-input-border bg-input p-2 text-xs text-foreground outline-none focus:border-primary" />
      <div className="mt-2 flex gap-2"><button type="button" disabled={working || unstaged.length === 0} onClick={() => void perform("git:stage-all")} className="git-button flex-1"><Plus size={14} /> Stage All</button><button type="button" disabled={working || !message.trim() || staged.length === 0} onClick={() => void perform("git:commit", message)} className="git-button flex-1"><Check size={14} /> Commit</button></div>
      <button type="button" disabled={working || !overview.canPush} onClick={() => void perform("git:push")} className="git-button mt-2 w-full">{workingAction === "git:push" ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />} {workingAction === "git:push" ? "Pushing…" : overview.hasUpstream ? `Push${overview.ahead ? ` (${overview.ahead})` : ""}` : "Publish Branch"}</button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
    <ChangeGroup title={`Staged Changes (${staged.length})`} changes={staged} icon={<Check size={13} />} actionLabel="Unstage" actionIcon={<Minus size={12} />} disabled={working} onAction={(filePath) => void perform("git:unstage-file", filePath)} />
    <ChangeGroup title={`Changes (${unstaged.length})`} changes={unstaged} icon={<CloudUpload size={13} />} actionLabel="Stage" actionIcon={<Plus size={12} />} disabled={working} onAction={(filePath) => void perform("git:stage-file", filePath)} />
    <div className="min-h-0 flex-1 overflow-y-auto border-t border-border"><div className="flex items-center justify-between px-3 pb-1 pt-2"><span className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">Recent commits</span><button type="button" disabled={historyRefreshing} onClick={() => void refreshHistory()} title="Refresh history" className="rounded p-1 text-foreground-muted hover:bg-surface-soft hover:text-foreground disabled:opacity-50"><RefreshCw size={13} className={historyRefreshing ? "animate-spin" : ""} /></button></div>{overview.commits.map((commit, index) => <div key={commit.hash} className="relative flex gap-2 px-3 py-1.5"><div className="flex flex-col items-center"><GitCommitHorizontal size={15} className="text-accent" />{index < overview.commits.length - 1 && <span className="mt-1 h-5 w-px bg-border" />}</div><div className="min-w-0"><p className="truncate text-xs text-foreground">{commit.message}</p><p className="truncate text-[10px] text-foreground-muted">{commit.hash} · {commit.author} · {commit.date}</p>{commit.decorations && <p className="truncate text-[10px] text-accent">{commit.decorations}</p>}</div></div>)}</div>
  </div>;
}

function ChangeGroup({ title, changes, icon, actionLabel, actionIcon, disabled, onAction }: { title: string; changes: Change[]; icon: React.ReactNode; actionLabel: string; actionIcon: React.ReactNode; disabled: boolean; onAction: (filePath: string) => void }) { return <div className="border-b border-border py-2"><div className="flex items-center gap-1 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">{icon}{title}</div>{changes.map((change) => <div key={change.path} className="group flex items-center gap-2 px-3 py-1 text-xs text-foreground-muted"><span className="w-4 text-accent">{change.status}</span><span className="min-w-0 flex-1 truncate">{change.path}</span><button type="button" disabled={disabled} onClick={() => onAction(change.path)} title={`${actionLabel} ${change.path}`} className="rounded p-1 text-foreground-muted opacity-0 transition hover:bg-surface-soft hover:text-foreground group-hover:opacity-100 disabled:cursor-not-allowed">{actionIcon}</button></div>)}</div>; }
function EmptyState({ text }: { text: string }) { return <div className="flex h-full items-center px-5 text-center text-xs text-foreground-muted">{text}</div>; }
