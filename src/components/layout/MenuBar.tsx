import { useState } from "react";
import Menu from "./Menu";
import { useUiStore } from "../../stores/uiStore";
import { useEditorStore } from "../../stores/editorStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const toggleTerminal = useUiStore((state) => state.toggleTerminal);
  const createNewFile = useEditorStore((state) => state.createNewFile);
  const createNewWindow = () => void window.appWindow.create();
  const openFile = useEditorStore((state) => state.openFile);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const saveActiveFile = useEditorStore((state) => state.saveActiveFile);
  const hasActiveTab = useEditorStore((state) => state.activeTabId !== null);

  return (
    <div
      className="
        flex h-8 shrink-0 items-center
        border-b border-border bg-surface
        select-none
      "
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="flex h-full items-center px-3">
        <span className="text-xs font-semibold text-foreground">
          jsCargoForge
        </span>
      </div>

      <Menu
        label="File"
        active={activeMenu === "file"}
        onOpen={() => setActiveMenu("file")}
      >
        <button className="menu-item" onClick={createNewFile}>
          New File
          <span>⌘N</span>
        </button>

        <button className="menu-item" onClick={createNewWindow}>
          New Window
          <span>⇧⌘N</span>
        </button>

        <button className="menu-item" onClick={() => void openFile()}>
          Open File
          <span>⌘O</span>
        </button>

        <button className="menu-item" onClick={() => void openWorkspace()}>
          Open Folder
          <span>⌘⇧O</span>
        </button>

        <div className="my-1 border-t border-border" />

        <button
          className="menu-item disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasActiveTab}
          onClick={() => void saveActiveFile()}
        >
          Save
          <span>⌘S</span>
        </button>
      </Menu>

      <Menu
        label="Edit"
        active={activeMenu === "edit"}
        onOpen={() => setActiveMenu("edit")}
      >
        <button className="menu-item">
          Undo
          <span>⌘Z</span>
        </button>

        <button className="menu-item">
          Redo
          <span>⇧⌘Z</span>
        </button>
      </Menu>

      <Menu
        label="View"
        active={activeMenu === "view"}
        onOpen={() => setActiveMenu("view")}
      >
        <button className="menu-item">
          Explorer
          <span>⌘⇧E</span>
        </button>

        <button className="menu-item" onClick={toggleTerminal}>
          Terminal
          <span>⌘J</span>
        </button>
      </Menu>

      <Menu
        label="Terminal"
        active={activeMenu === "terminal"}
        onOpen={() => setActiveMenu("terminal")}
      >
        <button className="menu-item" onClick={toggleTerminal}>
          Toggle Terminal
          <span>⌘J</span>
        </button>

        <button className="menu-item">
          New Terminal
          <span>⌘⇧`</span>
        </button>
      </Menu>

      <Menu
        label="Help"
        active={activeMenu === "help"}
        onOpen={() => setActiveMenu("help")}
      >
        <button className="menu-item">
          Keyboard Shortcuts
          <span>⌘K ⌘S</span>
        </button>
      </Menu>
    </div>
  );
}
