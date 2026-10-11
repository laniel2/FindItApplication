import { reactive } from 'vue';

// Shared state (module level) so any component can show a toast.
const toasts = reactive([]);
let nextId = 1;

function push(message, type = 'success', duration = 3200) {
  const id = nextId++;
  toasts.push({ id, message, type });
  setTimeout(() => dismiss(id), duration);
}

function dismiss(id) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i > -1) toasts.splice(i, 1);
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error', 4500),
  };
}
