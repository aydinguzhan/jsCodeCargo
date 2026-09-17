import { FileCode2, X } from "lucide-react";

export interface EditorTabData {
  id: string;
  name: string;
  path?: string;
  language?: "typescript" | "javascript" | "json" | "css" | "html";
  modified?: boolean;
  content: string;
}

interface EditorTabProps {
  tab: EditorTabData;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export default function EditorTab({
  tab,
  active,
  onSelect,
  onClose,
}: EditorTabProps) {
  return (
    <div
      className={`
        group
        flex
        h-full
        min-w-0
        max-w-52
        items-center
        border-r
        border-border
        transition-colors

        ${
          active
            ? "bg-background text-foreground"
            : "bg-surface text-foreground-muted hover:bg-surface-soft hover:text-foreground"
        }
      `}
    >
      <button
        type="button"
        onClick={onSelect}
        className="
          flex
          min-w-0
          flex-1
          items-center
          gap-2
          px-3
          text-left
        "
      >
        <FileCode2
          size={15}
          className={`
            shrink-0
            ${active ? "text-accent" : "text-foreground-muted"}
          `}
        />

        <span className="truncate text-xs">{tab.name}</span>

        {tab.modified && (
          <span
            className="
              ml-auto
              shrink-0
              text-xs
              text-foreground
            "
            title="Unsaved changes"
          >
            ●
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="
          mr-1
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded
          text-foreground-muted
          opacity-0
          transition
          group-hover:opacity-100
          hover:bg-surface-soft
          hover:text-foreground
        "
        aria-label={`Close ${tab.name}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
