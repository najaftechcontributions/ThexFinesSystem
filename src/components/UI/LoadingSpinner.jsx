import React from "react";

function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="loading">
      <div className="flex flex-col items-center gap-4">
        <div className={`spinner ${sizeClasses[size]}`}></div>
        {text && <p className="text-muted">{text}</p>}
      </div>
    </div>
  );
}

export default LoadingSpinner;
