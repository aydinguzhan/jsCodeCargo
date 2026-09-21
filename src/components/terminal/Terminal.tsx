import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal as XtermTerminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { useThemeStore } from "../../stores/themeStore";
import { useUiStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

type Props = {
  onClose: () => void;
};

export default function Terminal({ onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((state) => state.theme);
  const workspacePath = useWorkspaceStore((state) => state.rootPath);
  const runRequest = useUiStore((state) => state.terminalRunRequest);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const terminal = new XtermTerminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      scrollback: 5_000,
      theme: theme === "dark"
        ? { background: "#111827", foreground: "#e5e7eb", cursor: "#e5e7eb" }
        : { background: "#ffffff", foreground: "#1f2937", cursor: "#1f2937" },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(container);
    fitAddon.fit();

    let terminalId: string | null = null;
    let disposed = false;
    const stopData = window.terminal.onData(({ terminalId: incomingId, data }) => {
      if (incomingId === terminalId) {
        terminal.write(data);
      }
    });
    const stopExit = window.terminal.onExit(({ terminalId: incomingId, exitCode }) => {
      if (incomingId === terminalId) {
        terminal.write(`\r\nProcess exited with code ${exitCode}\r\n`);
      }
    });
    const stopInput = terminal.onData((data) => {
      if (terminalId) {
        window.terminal.write(terminalId, data);
      }
    });
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      if (terminalId) {
        window.terminal.resize(terminalId, terminal.cols, terminal.rows);
      }
    });
    resizeObserver.observe(container);

    const terminalStart = runRequest
      ? window.terminal.runFile({
          filePath: runRequest.filePath,
          cwd: runRequest.cwd,
          cols: terminal.cols,
          rows: terminal.rows,
        })
      : window.terminal.create({
          cwd: workspacePath ?? undefined,
          cols: terminal.cols,
          rows: terminal.rows,
        });

    void terminalStart.then((result) => {
        if ("error" in result && result.error) {
          terminal.write(`\r\n${result.error}\r\n`);
          return;
        }
        const id = result.terminalId;
        if (!id) {
          return;
        }
        if (disposed) {
          void window.terminal.close(id);
          return;
        }

        terminalId = id;
        terminal.focus();
      });

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      stopInput.dispose();
      stopData();
      stopExit();
      if (terminalId) {
        void window.terminal.close(terminalId);
      }
      terminal.dispose();
    };
  }, [runRequest, theme, workspacePath]);

  return (
    <div className="flex h-64 flex-col border-t border-border bg-surface">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-medium text-foreground">TERMINAL</span>
        <button
          type="button"
          className="text-xs text-foreground-muted hover:text-foreground"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 p-2" />
    </div>
  );
}
