// src/components/terminal/Terminal.tsx

import { useState } from "react";
type Props = {
  onClose: () => void;
};
export default function Terminal({ onClose }: Props) {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!command.trim()) return;

    setOutput((current) => [...current, `$ ${command}`]);

    setCommand("");
    if (command === "clear") setOutput([]);
  };

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

      <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs">
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex">
          <span className="mr-2">$</span>

          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className="min-w-0 flex-1 bg-transparent outline-none"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
