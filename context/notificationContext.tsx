"use client";

import { createContext, useContext, useState } from "react";

export interface NotificationItem {
  id: number;
  text: string;
  style?: string;
}

export const remove = (arr: NotificationItem[], item: NotificationItem): NotificationItem[] => {
  const newArr = [...arr];
  const index = newArr.findIndex((i) => i.id === item.id);
  if (index !== -1) newArr.splice(index, 1);
  return newArr;
};

let newIndex = 0;

export const add = (
  arr: NotificationItem[],
  text: string,
  style?: string
): NotificationItem[] => {
  newIndex += 1;
  return [...arr, { id: newIndex, text, style }];
};


interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (text: string, style?: string) => void;
  removeNotification: (notification: NotificationItem) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (text: string, style?: string) => {
    setNotifications(prev => add(prev, text, style));
  };

  const removeNotification = (notification: NotificationItem) => {
    setNotifications(prev => remove(prev, notification));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};