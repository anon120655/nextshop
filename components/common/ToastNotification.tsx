"use client";

import { toast } from "sonner";

interface ToastNotificationProps {
  errorMessages?: string | string[];
}

const ToastNotification = ({ errorMessages }: ToastNotificationProps) => {
  if (!errorMessages) return null;

  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.isArray(errorMessages) ? (
        errorMessages.map((message, index) => (
          <span key={index} className="text-sm text-red-600">
            {message}
          </span>
        ))
      ) : (
        <span className="text-sm text-red-600">{errorMessages}</span>
      )}
    </div>
  );
};

export const showErrorToast = ({ errorMessages }: ToastNotificationProps) => {
  if (!errorMessages) return;

  toast(<ToastNotification errorMessages={errorMessages} />, {
    position: "top-center",
    style: {
      background: "#fee2e2",
      border: "1px solid #ef4444",
      borderRadius: "8px",
      padding: "8px",
    },
    duration: 2000,
  });
};

export default ToastNotification;
