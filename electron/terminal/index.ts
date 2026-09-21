import { randomUUID } from "node:crypto";
import path from "node:path";
import * as pty from "node-pty";
import type { IpcMainEvent, IpcMainInvokeEvent, WebContents } from "electron";

type TerminalOptions = {
  cwd?: string;
  cols: number;
  rows: number;
};

type RunFileOptions = TerminalOptions & {
  filePath: string;
};

type TerminalSession = {
  process: pty.IPty;
  owner: WebContents;
};

const sessions = new Map<string, TerminalSession>();

function sendToOwner(
  session: TerminalSession,
  channel: string,
  payload: Record<string, unknown>,
) {
  if (session.owner.isDestroyed()) {
    return;
  }

  try {
    session.owner.send(channel, payload);
  } catch {
    // The renderer can be destroyed between isDestroyed() and send().
  }
}

function disposeSession(terminalId: string, session: TerminalSession) {
  sessions.delete(terminalId);
  try {
    session.process.kill();
  } catch {
    // The PTY may have already exited.
  }
}

function shellCommand() {
  if (process.platform === "win32") {
    return { file: process.env.COMSPEC ?? "powershell.exe", args: [] };
  }

  return {
    file: process.env.SHELL ?? (process.platform === "darwin" ? "/bin/zsh" : "/bin/bash"),
    args: [],
  };
}

function ownsSession(sender: WebContents, terminalId: string) {
  const session = sessions.get(terminalId);
  return session?.owner.id === sender.id ? session : undefined;
}

export function createTerminal(
  event: IpcMainInvokeEvent,
  { cwd, cols, rows }: TerminalOptions,
) {
  const shell = shellCommand();
  return startTerminal(event, shell.file, shell.args, { cwd, cols, rows });
}

function startTerminal(
  event: IpcMainInvokeEvent,
  file: string,
  args: string[],
  { cwd, cols, rows }: TerminalOptions,
) {
  const terminalId = randomUUID();
  const terminal = pty.spawn(file, args, {
    name: "xterm-256color",
    cols: Math.max(2, cols),
    rows: Math.max(1, rows),
    cwd: cwd ?? process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
    },
  });

  const session = { process: terminal, owner: event.sender };
  sessions.set(terminalId, session);

  terminal.onData((data) => {
    if (sessions.get(terminalId) === session) {
      sendToOwner(session, "terminal:data", { terminalId, data });
    }
  });
  terminal.onExit(({ exitCode, signal }) => {
    if (sessions.get(terminalId) === session) {
      sessions.delete(terminalId);
      sendToOwner(session, "terminal:exit", { terminalId, exitCode, signal });
    }
  });

  return { terminalId };
}

function commandForFile(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".js":
    case ".mjs":
    case ".cjs":
      return { file: process.execPath, args: [filePath] };
    case ".py":
      return { file: process.platform === "win32" ? "python" : "python3", args: [filePath] };
    case ".rb":
      return { file: "ruby", args: [filePath] };
    case ".go":
      return { file: "go", args: ["run", filePath] };
    default:
      return undefined;
  }
}

export function runFileTerminal(event: IpcMainInvokeEvent, options: RunFileOptions) {
  const command = commandForFile(options.filePath);
  if (!command) {
    return {
      error: `No runner is configured for ${path.extname(options.filePath) || "this file type"}.`,
    };
  }

  try {
    return startTerminal(event, command.file, command.args, options);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not start file runner.",
    };
  }
}

export function writeTerminal(event: IpcMainEvent, terminalId: string, data: string) {
  ownsSession(event.sender, terminalId)?.process.write(data);
}

export function resizeTerminal(
  event: IpcMainEvent,
  terminalId: string,
  cols: number,
  rows: number,
) {
  ownsSession(event.sender, terminalId)?.process.resize(
    Math.max(2, cols),
    Math.max(1, rows),
  );
}

export function closeTerminal(event: IpcMainInvokeEvent, terminalId: string) {
  const session = ownsSession(event.sender, terminalId);
  if (session) {
    disposeSession(terminalId, session);
  }
}

export function closeTerminalsFor(owner: WebContents) {
  for (const [terminalId, session] of sessions) {
    if (session.owner.id === owner.id) {
      disposeSession(terminalId, session);
    }
  }
}

export function closeAllTerminals() {
  for (const [terminalId, session] of sessions) {
    disposeSession(terminalId, session);
  }
}
