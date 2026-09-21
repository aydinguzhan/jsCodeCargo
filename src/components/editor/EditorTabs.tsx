import { Play, Plus } from "lucide-react";
import EditorTab, { type EditorTabData } from "./EditorTab";

interface EditorTabsProps {
  tabs: EditorTabData[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab?: () => void;
  onRun?: () => void;
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onRun,
}: EditorTabsProps) {
  return (
    <div
      className="
        flex
        h-10
        shrink-0
        items-stretch
        border-b
        border-border
        bg-surface
      "
    >
      <div className="flex min-w-0 flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <EditorTab
            key={tab.id}
            tab={tab}
            active={tab.id === activeTabId}
            onSelect={() => onSelectTab(tab.id)}
            onClose={() => onCloseTab(tab.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNewTab}
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          border-l
          border-border
          text-foreground-muted
          transition
          hover:bg-surface-soft
          hover:text-foreground
        "
        title="New file"
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        onClick={onRun}
        className="
          flex
          h-10
          w-10
          text-green-600
          shrink-0
          items-center
          justify-center
          border-l
          border-border
          transition
          hover:bg-surface-soft
          hover:text-foreground
          hover:cursor-pointer
        "
        title="Run active file"
      >
        <Play size={16} className="fill-green-600" />
      </button>
    </div>
  );
}
