import Editor from "@monaco-editor/react";
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
  return (
    <Editor
      height={"100%"}
      width={"100%"}
      defaultLanguage={language}
      defaultValue={content}
      onChange={handleChange}
      theme="vs-dark"
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
