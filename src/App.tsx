import "./App.css";

import TitleBar from "./components/layout/TitleBar";
import ActivityBar from "./components/layout/ActivityBar";
import Sidebar from "./components/layout/Sidebar";
import Editor from "./components/editor/Editor";
import StatusBar from "./components/layout/StatusBar";
import MenuBar from "./components/layout/MenuBar";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useUiStore } from "./stores/uiStore";
import GitGraph from "./components/git/GitGraph";
import ToastViewport from "./components/ui/ToastViewport";

function App() {
  useGlobalShortcuts();
  const sidebarView = useUiStore((state) => state.sidebarView);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <MenuBar />

      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <ActivityBar />

        <Sidebar />

        <main className="min-w-0 flex-1">
          {sidebarView === "git" ? <GitGraph /> : <Editor />}
        </main>
      </div>

      <StatusBar />
      <ToastViewport />
    </div>
  );
}

export default App;
