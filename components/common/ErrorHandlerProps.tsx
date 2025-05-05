"use client";

import { useEffect, useRef } from "react";
import { showErrorToast } from "@/components/common/ToastNotification";

interface ErrorHandlerProps {
  errorMessage: string | null;
}

const ErrorHandler = ({ errorMessage }: ErrorHandlerProps) => {
  const prevErrorMessage = useRef<string | null>(null);

  useEffect(() => {
    // ตรวจสอบว่า errorMessage เปลี่ยนแปลงและไม่ว่างเปล่า
    if (errorMessage && errorMessage !== prevErrorMessage.current) {
      showErrorToast({ errorMessages: errorMessage });
      prevErrorMessage.current = errorMessage; // อัปเดตค่า prevErrorMessage
    }
  }, [errorMessage]);

  return null;
};

export default ErrorHandler;
