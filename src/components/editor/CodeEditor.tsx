import Editor from "@monaco-editor/react";
import { useThemeStore } from "../../stores/themeStore";
type Props = {
  language?: string;
  content: string;
  handleChange: (e: string | undefined) => void;
  handleEditorMount?: (e: string | undefined) => void;
};

export default function CodeEditor({
  language = "javascript",
  content,
  handleChange,
}: Props) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Editor
      height={"100%"}
      width={"100%"}
      defaultLanguage={language}
      defaultValue={content}
      onChange={handleChange}
      theme={theme === "dark" ? "vs-dark" : "light"}
      className="bg-surface-soft"
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        padding: {
          top: 16,
        },
        automaticLayout: true,
      }}
    />
  );
}
