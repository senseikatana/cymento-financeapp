import { ref } from "vue";

export type ToastVariant = "default" | "success" | "error";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

const toasts = ref<Toast[]>([]);
let counter = 0;

function addToast(title: string, variant: ToastVariant, description?: string) {
  const id = String(++counter);
  toasts.value.push({ id, title, variant, description });
  // Auto-dismiss after 4s
  if (import.meta.client) {
    setTimeout(() => dismissToast(id), 4000);
  }
  return id;
}

function dismissToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToast() {
  return {
    toasts,
    toast: {
      success: (title: string, description?: string) =>
        addToast(title, "success", description),
      error: (title: string, description?: string) =>
        addToast(title, "error", description),
      default: (title: string, description?: string) =>
        addToast(title, "default", description),
    },
    dismiss: dismissToast,
  };
}
