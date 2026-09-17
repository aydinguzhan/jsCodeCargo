import { Command } from "lucide-react";
import CommandBar from "../command/CommandBar";
import ThemeSwitch from "../theme/ThemeSwitch";

export default function TitleBar() {
  return (
    <header
      className="
        flex
        h-12
        shrink-0
        items-center
        border-b
        border-border
        bg-surface
        px-3
      "
    >
      <div className="flex w-48 shrink-0 items-center gap-2">
        <Command size={18} />

        <span className="text-sm font-semibold">JS Cargo Forge</span>
      </div>

      <div className="flex flex-1 justify-center">
        <CommandBar />
      </div>

      <div className="flex w-48 shrink-0 justify-end">
        <ThemeSwitch />
      </div>
    </header>
  );
}
