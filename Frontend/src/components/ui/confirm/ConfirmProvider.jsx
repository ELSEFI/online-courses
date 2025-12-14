import { useCallback, useEffect, useState } from "react";
import { ConfirmContext } from "./ConfirmContext";
import ConfirmDialog from "./ConfirmDialog";

export default function ConfirmProvider({ children }) {
  const [state, setState] = useState({ isOpen: false });

  const confirm = useCallback(
    ({ title, message, confirmText, cancelText, variant }) =>
      new Promise((resolve) => {
        setState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          variant,
          onConfirm: () => {
            setState({ isOpen: false });
            resolve(true);
          },
          onCancel: () => {
            setState({ isOpen: false });
            resolve(false);
          },
        });
      }),
    []
  );

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      @keyframes scaleIn { from {transform:scale(.9);opacity:0} to {transform:scale(1);opacity:1} }
      .animate-fadeIn { animation: fadeIn .2s ease-out }
      .animate-scaleIn { animation: scaleIn .3s ease-out }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog {...state} />
    </ConfirmContext.Provider>
  );
}
