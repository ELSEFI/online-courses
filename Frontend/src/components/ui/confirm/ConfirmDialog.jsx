import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-600/20 text-red-500",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "bg-orange-600/20 text-orange-500",
      button: "bg-orange-600 hover:bg-orange-700",
    },
    info: {
      icon: "bg-blue-600/20 text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl border border-gray-700 animate-scaleIn">
        <div className="flex items-start justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.icon}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 text-sm">{message}</p>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white rounded-lg ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
