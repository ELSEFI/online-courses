import { useCallback, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { ToastContext } from "./ToastContext";
import "./ToastStyles";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (m, d) => showToast(m, "success", d),
    error: (m, d) => showToast(m, "error", d),
    warning: (m, d) => showToast(m, "warning", d),
    info: (m, d) => showToast(m, "info", d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-9999 space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const config = {
    success: { icon: CheckCircle, bg: "bg-green-600 border-green-500" },
    error: { icon: XCircle, bg: "bg-red-600 border-red-500" },
    warning: { icon: AlertCircle, bg: "bg-orange-600 border-orange-500" },
    info: { icon: Info, bg: "bg-blue-600 border-blue-500" },
  };

  const { icon: Icon, bg } = config[toast.type] || config.info;

  return (
    <div
      className={`flex items-center gap-3 min-w-[320px] max-w-md p-4 rounded-lg shadow-2xl border-l-4 ${bg} text-white pointer-events-auto animate-slideIn`}
    >
      <Icon size={22} className="shrink-0 opacity-90" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 hover:bg-white/20 rounded p-1"
      >
        <X size={18} />
      </button>
    </div>
  );
}
