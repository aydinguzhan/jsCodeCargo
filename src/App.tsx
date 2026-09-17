import "./App.css";

import TitleBar from "./components/layout/TitleBar";
import ActivityBar from "./components/layout/ActivityBar";
import Sidebar from "./components/layout/Sidebar";
import Editor from "./components/editor/Editor";
import StatusBar from "./components/layout/StatusBar";
import MenuBar from "./components/layout/MenuBar";
import { useState } from "react";

function App() {
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <MenuBar onToggleTerminal={() => setTerminalOpen((value) => !value)} />

      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <ActivityBar />

        <Sidebar />

        <main className="min-w-0 flex-1">
          <Editor
            terminalOpen={terminalOpen}
            handleTerminalClose={() => setTerminalOpen((value) => !value)}
          />
        </main>
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
