import type { Ref } from 'vue';

export type ToastVariant = 'default' | 'success' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export function useToast() {
  // useState: estado por petición SSR, sin fugas entre usuarios
  const toasts = useState<Toast[]>('toasts', () => []);
  const counter = useState<number>('toasts-counter', () => 0);

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function addToast(title: string, variant: ToastVariant, description?: string) {
    const id = String(++counter.value);
    toasts.value.push({ id, title, variant, description });
    if (import.meta.client) {
      setTimeout(dismissToast, 4000, id);
    }
    return id;
  }

  return {
    toasts: toasts as Ref<Toast[]>,
    toast: {
      success: (title: string, description?: string) => addToast(title, 'success', description),
      error: (title: string, description?: string) => addToast(title, 'error', description),
      default: (title: string, description?: string) => addToast(title, 'default', description),
    },
    dismiss: dismissToast,
  };
}
