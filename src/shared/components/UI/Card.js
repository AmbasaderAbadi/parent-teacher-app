import React from "react";

export const Card = ({ children, className = "", padding = "md" }) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
