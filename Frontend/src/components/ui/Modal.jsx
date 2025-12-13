import React from "react";
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
