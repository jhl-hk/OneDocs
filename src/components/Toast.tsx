import React from "react";
import { create } from "zustand";

interface ToastState {
  isVisible: boolean;
  message: string;
  show: (message: string, duration?: number) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  isVisible: false,
  message: "",
  show: (message: string, duration: number = 3000) => {
    set({ isVisible: true, message });
    if (duration > 0) {
      setTimeout(() => {
        set({ isVisible: false });
      }, duration);
    }
  },
  hide: () => set({ isVisible: false }),
}));

export const Toast: React.FC = () => {
  const { isVisible, message } = useToast();

  if (!isVisible) return null;

  return (
    <div className="toast">
      <span>{message}</span>
    </div>
  );
};
