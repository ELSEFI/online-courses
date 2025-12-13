import React from "react";
export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12 text-gray-400">
      {Icon && <Icon className="w-16 h-16 mx-auto mb-4" />}
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p>{description}</p>
    </div>
  );
}
