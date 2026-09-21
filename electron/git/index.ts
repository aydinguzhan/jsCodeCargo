import { simpleGit } from "simple-git";

function gitFor(cwd: string) {
  return simpleGit({ baseDir: cwd, binary: "git", maxConcurrentProcesses: 1, trimmed: true });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Git operation failed";
}

export async function getGitOverview(cwd: string) {
  const git = gitFor(cwd);
  try {
    if (!(await git.checkIsRepo())) {
      return { isRepository: false, changes: [], commits: [], branch: null, ahead: 0, behind: 0, canPush: false, hasUpstream: false };
    }

    const [status, log, remotes] = await Promise.all([git.status(), git.log({ maxCount: 24, "--all": null }), git.getRemotes()]);
    const changes = status.files.map((file) => ({
      path: file.path,
      status: `${file.index}${file.working_dir}`.trim() || "?",
      staged: file.index !== " " && file.index !== "?",
    }));

    return {
      isRepository: true,
      branch: status.current ?? "HEAD detached",
      changes,
      commits: log.all.map((commit) => ({ hash: commit.hash.slice(0, 7), author: commit.author_name, date: commit.date, message: commit.message, decorations: commit.refs })),
      ahead: status.ahead,
      behind: status.behind,
      canPush: log.total > 0 && remotes.length > 0 && (status.ahead > 0 || !status.tracking),
      hasUpstream: Boolean(status.tracking),
    };
  } catch (error) {
    return { isRepository: false, changes: [], commits: [], branch: null, ahead: 0, behind: 0, canPush: false, hasUpstream: false, error: errorMessage(error) };
  }
}

export async function stageAll(cwd: string) {
  try { await gitFor(cwd).add(["--all"]); return { success: true }; }
  catch (error) { return { success: false, error: errorMessage(error) }; }
}

export async function stageFile(cwd: string, filePath: string) {
  try { await gitFor(cwd).add(["--", filePath]); return { success: true }; }
  catch (error) { return { success: false, error: errorMessage(error) }; }
}

export async function unstageFile(cwd: string, filePath: string) {
  try { await gitFor(cwd).reset(["HEAD", "--", filePath]); return { success: true }; }
  catch (error) { return { success: false, error: errorMessage(error) }; }
}

export async function createCommit(cwd: string, message: string) {
  try { await gitFor(cwd).commit(message); return { success: true }; }
  catch (error) { return { success: false, error: errorMessage(error) }; }
}

export async function pushCurrentBranch(cwd: string) {
  const git = gitFor(cwd);
  try {
    const status = await git.status();
    if (status.tracking) await git.push();
    else {
      const [remote] = await git.getRemotes();
      if (!remote) return { success: false, error: "No Git remote is configured" };
      await git.push(["--set-upstream", remote.name, "HEAD"]);
    }
    return { success: true };
  } catch (error) { return { success: false, error: errorMessage(error) }; }
}
