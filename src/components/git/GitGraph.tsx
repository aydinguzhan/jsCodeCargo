import { GitBranch, GitCommitHorizontal, GitPullRequest, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useGitStore } from "../../stores/gitStore";

type Commit = { hash: string; author: string; date: string; message: string; decorations: string };
type Overview = { isRepository: boolean; branch: string | null; commits: Commit[]; ahead: number; behind: number };
const MIN_LOADING_DURATION = 450;

export default function GitGraph() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const rootPath = useWorkspaceStore((state) => state.rootPath);
  const historyVersion = useGitStore((state) => state.historyVersion);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!rootPath) {
      setOverview(null);
      return;
    }
    const startedAt = Date.now();
    setRefreshing(true);
    try {
      await window.ipcRenderer.invoke("workspace:restore-root", rootPath);
      const next = await window.ipcRenderer.invoke("git:overview") as Overview;
      setOverview(next);
    } finally {
      const remaining = MIN_LOADING_DURATION - (Date.now() - startedAt);
      if (remaining > 0) await new Promise<void>((resolve) => window.setTimeout(resolve, remaining));
      setRefreshing(false);
    }
  }, [rootPath]);

  useEffect(() => { void refresh(); }, [refresh, historyVersion]);

  if (!rootPath) {
    return <div className="flex h-full items-center justify-center bg-background text-sm text-foreground-muted">Open a folder to view its Git history.</div>;
  }

  if (!overview?.isRepository) {
    return <div className="flex h-full items-center justify-center bg-background text-sm text-foreground-muted">Open a Git repository to view its history.</div>;
  }

  return <section className="flex h-full min-h-0 flex-col bg-background">
    <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
      <span className="rounded-md bg-accent-soft p-2 text-foreground"><GitBranch size={20} /></span>
      <div><h1 className="text-sm font-semibold text-foreground">Commit Graph</h1><p className="text-xs text-foreground-muted">{overview.branch} · ↑ {overview.ahead} ahead · ↓ {overview.behind} behind</p></div>
      <button type="button" disabled={refreshing} onClick={() => void refresh()} className="ml-auto rounded-md p-2 text-foreground-muted transition hover:bg-surface-soft hover:text-foreground disabled:opacity-50" title="Refresh history"><RefreshCw size={17} className={refreshing ? "animate-spin" : ""} /></button>
    </header>
    <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs text-foreground-muted"><GitPullRequest size={15} className="text-accent" /> Branches and recent commits</div>
        {overview.commits.map((commit, index) => (
          <article key={commit.hash} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3">
            <div className="flex flex-col items-center"><span className="z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-accent bg-surface text-accent"><GitCommitHorizontal size={15} /></span>{index < overview.commits.length - 1 && <span className="w-0.5 flex-1 bg-accent-soft" />}</div>
            <div className="pb-5 pt-1"><div className="rounded-md border border-border bg-background px-4 py-3"><div className="flex flex-wrap items-center gap-2"><p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{commit.message}</p>{commit.decorations && <span className="rounded bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-foreground">{commit.decorations}</span>}</div><p className="mt-1 text-xs text-foreground-muted"><span className="font-mono text-accent">{commit.hash}</span> · {commit.author} · {commit.date}</p></div></div>
          </article>
        ))}
      </div>
    </div>
  </section>;
}
