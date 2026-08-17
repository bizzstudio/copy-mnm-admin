// src/hooks/useToasts.js
import { useCallback, useRef, useState } from "react";

/**
 * A small toast queue for the platform screens.
 *
 * The ported admin uses react-toastify (`@/utils/toast`) everywhere else and new
 * work in the ported screens should keep using it. This exists only because the
 * platform screens were written against the shared `ToastStack` primitive, and
 * rewriting them to toastify would be churn for no visible difference.
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const push = useCallback((tone, text) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return {
    toasts,
    success: (text) => push("success", text),
    error: (text) => push("danger", text),
    info: (text) => push("info", text),
    dismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
  };
}
