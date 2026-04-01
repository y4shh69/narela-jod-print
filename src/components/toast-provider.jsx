import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(
    () => ({
      showToast({ title, description, variant = "success" }) {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, title, description, variant }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3600);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="pointer-events-auto glass rounded-3xl border p-4"
            >
              <div className="flex items-start gap-3">
                {toast.variant === "error" ? (
                  <CircleAlert className="mt-0.5 h-5 w-5 text-rose-500" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{toast.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{toast.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200/50 hover:text-slate-700 dark:hover:bg-slate-700/40 dark:hover:text-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
