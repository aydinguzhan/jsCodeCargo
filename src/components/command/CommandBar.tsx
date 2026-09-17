import { Search } from "lucide-react";
import { useState } from "react";
import CommandPalette from "./CommandPalette";

export default function CommandBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full max-w-xl">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex
          h-8
          w-full
          items-center
          gap-2
          rounded-md
          border
          border-border
          bg-background
          px-3
          text-sm
          text-foreground-muted
          transition
          hover:border-primary
          hover:text-foreground
        "
      >
        <Search size={15} />

        <span className="flex-1 text-left">Search files, commands...</span>

        <kbd
          className="
            hidden
            rounded
            border
            border-border
            bg-surface-soft
            px-1.5
            py-0.5
            text-[10px]
            sm:block
          "
        >
          ⌘ P
        </kbd>
      </button>

      {open && <CommandPalette onClose={() => setOpen(false)} />}
    </div>
  );
}
