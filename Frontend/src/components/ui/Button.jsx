import React from "react";

const variants = {
  primary: "bg-purple-600 hover:bg-purple-700",
  danger: "bg-red-600 hover:bg-red-700",
  success: "bg-green-600 hover:bg-green-700",
  secondary: "bg-gray-600 hover:bg-gray-700",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
