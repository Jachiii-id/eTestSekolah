import { reactive } from 'vue';

export interface Toast {
  id: number;
  message: string;
  tone: 'warning' | 'info' | 'error';
  durationMs: number;
}

let nextId = 1;
const toasts = reactive<Toast[]>([]);

export function useToasts() {
  function pushToast(message: string, tone: Toast['tone'] = 'warning', durationMs = 4000) {
    const id = nextId++;
    toasts.push({ id, message, tone, durationMs });
    window.setTimeout(() => dismissToast(id), durationMs);
  }

  function dismissToast(id: number) {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.splice(idx, 1);
  }

  return { toasts, pushToast, dismissToast };
}
