export default function StatusBar() {
  return (
    <footer
      className="
        flex
        h-6
        shrink-0
        items-center
        justify-between
        bg-primary
        px-3
        text-[11px]
        text-primary-foreground
      "
    >
      <div className="flex gap-4">
        <span>main</span>
        <span>0 errors</span>
      </div>

      <div className="flex gap-4">
        <span>TypeScript</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
      </div>
    </footer>
  );
}
