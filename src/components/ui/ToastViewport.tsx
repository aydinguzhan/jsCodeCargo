import { CheckCircle2, X, XCircle } from "lucide-react";
import { useToastStore } from "../../stores/toastStore";

export default function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  return <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
    {toasts.map((toast) => {
      const success = toast.tone === "success";
      return <div key={toast.id} role="status" className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3 shadow-xl">
        {success ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> : <XCircle size={18} className="shrink-0 text-red-500" />}
        <p className="min-w-0 flex-1 text-sm text-foreground">{toast.message}</p>
        <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification" className="rounded p-1 text-foreground-muted hover:bg-surface-soft hover:text-foreground"><X size={15} /></button>
      </div>;
    })}
  </div>;
}
