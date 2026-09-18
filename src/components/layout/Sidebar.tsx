export default function Sidebar() {
  return (
    <aside
      className="
        hidden
        w-64
        shrink-0
        border-r
        border-border
        bg-surface
        md:block
      "
    >
      <div className="border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase text-foreground-muted">
          Explorer
        </span>
      </div>

      <div className="p-3 text-sm text-foreground-muted">No folder opened</div>
    </aside>
  );
}
