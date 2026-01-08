import { useNotifications } from "@/context/notificationContext";

export const useNotify = () => {
  const { addNotification } = useNotifications();

  const notify = (text: string, style?: "success" | "error" | "warning" | "light" | string) => {
    addNotification(text, style);
  };

  return { notify };
};