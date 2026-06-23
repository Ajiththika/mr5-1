"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { buildAppNotifications } from "@/lib/notifications/buildAppNotifications";
import type { AppNotification, NotificationInput } from "@/lib/notifications/types";
import { getBrandSoundManager } from "@/lib/audio";

const STORAGE_KEY = "mr5_notifications_v2";

interface StoredNotification extends Omit<AppNotification, "timestamp"> {
  timestamp: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
  notify: (input: NotificationInput) => void;
  openNotification: (notification: AppNotification) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function parseStored(raw: string | null): AppNotification[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredNotification[];
    return parsed.map((n) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return [];
  }
}

function mergeWithFresh(
  existing: AppNotification[],
  fresh: AppNotification[],
): AppNotification[] {
  const byId = new Map(existing.map((n) => [n.id, n]));

  return fresh.map((item) => {
    const prev = byId.get(item.id);
    if (prev) {
      return { ...item, read: prev.read, timestamp: prev.timestamp };
    }
    return item;
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, userPreferences } = useEnhancedUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const inAppEnabled = userPreferences.notifications.inApp;

  useEffect(() => {
    setNotifications(parseStored(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [hydrated, notifications]);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fresh = await buildAppNotifications();
    setNotifications((prev) => mergeWithFresh(prev, fresh));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    void refreshNotifications();
    const interval = setInterval(() => void refreshNotifications(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  const notify = useCallback(
    (input: NotificationInput) => {
      if (!inAppEnabled) return;

      const entry: AppNotification = {
        id: input.id,
        title: input.title,
        message: input.message,
        type: input.type,
        href: input.href,
        action: input.action,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const without = prev.filter((n) => n.id !== entry.id);
        return [entry, ...without].slice(0, 15);
      });

      if (!input.skipSound) {
        getBrandSoundManager().playNotification(input.type);
      }

      if (!input.skipToast) {
        toast(input.title, { description: input.message });
      }
    },
    [inAppEnabled],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const openNotification = useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);
      const target = notification.action?.href ?? notification.href;
      if (target) {
        setIsOpen(false);
        router.push(target);
      }
    },
    [markAsRead, router],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      isOpen,
      setIsOpen,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      refreshNotifications,
      notify,
      openNotification,
    }),
    [
      notifications,
      unreadCount,
      isOpen,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      refreshNotifications,
      notify,
      openNotification,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
