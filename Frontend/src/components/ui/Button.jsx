import React from "react";

const variants = {
  primary: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
  danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg text-white font-medium 
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current
        ${variants[variant]} 
        ${className}
      `}
    >
      {children}
    </button>
  );
}
