"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Notification from "./notification";
import { useNotifications } from "@/context/notificationContext";

interface NotificationContainerProps {
  position?: "top" | "bottom";
}

export const NotificationContainer = ({ position = "bottom" }: NotificationContainerProps) => {
  const { notifications, removeNotification } = useNotifications();

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((notification) =>
      setTimeout(() => removeNotification(notification), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  return (
    <div className={`fixed z-50 pointer-events-none w-full max-w-full left-0 right-0 ${position === 'top' ? 'top-5' : 'bottom-0'}`}>
      <ul className={`absolute ${position === 'top' ? 'top-5' : 'bottom-0'} left-5 flex ${position === 'top' ? 'flex-col-reverse' : 'flex-col'} items-end gap-2.5 m-0 p-0 list-none pointer-events-auto`}>
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification)}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};