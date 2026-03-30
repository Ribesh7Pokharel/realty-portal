import { useState, useEffect } from "react";

export default function Toast({ message, type = "default", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return <div className={`toast ${type}`}>{message}</div>;
}

// Hook for easy toast usage
export function useToast() {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "default") {
    setToast({ message, type, key: Date.now() });
  }

  function ToastEl() {
    if (!toast) return null;
    return (
      <Toast
        key={toast.key}
        message={toast.message}
        type={toast.type}
        onDone={() => setToast(null)}
      />
    );
  }

  return { showToast, ToastEl };
}
