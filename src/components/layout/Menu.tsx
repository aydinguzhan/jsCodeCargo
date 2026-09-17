import type { ReactNode } from "react";

interface MenuProps {
  label: string;
  active: boolean;
  onOpen: () => void;
  children: ReactNode;
}

export default function Menu({ label, active, onOpen, children }: MenuProps) {
  return (
    <div className="relative h-full">
      <button
        type="button"
        onClick={onOpen}
        className={`
          flex h-full items-center px-3 text-xs
          transition-colors
          ${
            active
              ? "bg-surface-soft text-foreground"
              : "text-foreground-muted hover:bg-surface-soft hover:text-foreground"
          }
        `}
      >
        {label}
      </button>

      {active && (
        <div
          className="
            absolute left-0 top-full z-50
            min-w-52
            rounded-md border border-border
            bg-surface p-1 shadow-lg
          "
        >
          {children}
        </div>
      )}
    </div>
  );
}
