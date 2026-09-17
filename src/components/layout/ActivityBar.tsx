import { Files, Search, GitBranch, Settings } from "lucide-react";

export default function ActivityBar() {
  return (
    <aside
      className="
        flex
        w-12
        shrink-0
        flex-col
        items-center
        justify-between
        border-r
        border-border
        bg-surface
        py-2
      "
    >
      <div className="flex flex-col gap-2">
        <IconButton icon={<Files size={19} />} />
        <IconButton icon={<Search size={19} />} />
        <IconButton icon={<GitBranch size={19} />} />
      </div>

      <IconButton icon={<Settings size={19} />} />
    </aside>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-md
        text-foreground-muted
        transition
        hover:bg-surface-soft
        hover:text-foreground
      "
    >
      {icon}
    </button>
  );
}
