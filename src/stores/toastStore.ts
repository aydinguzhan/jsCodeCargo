import { create } from "zustand";

export type Toast = { id: number; message: string; tone: "success" | "error" };

type ToastState = {
  toasts: Toast[];
  showToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message, tone = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    window.setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
