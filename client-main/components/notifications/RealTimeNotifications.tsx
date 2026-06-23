"use client";

import { Bell, X, CheckCircle, AlertCircle, Info, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationContext";
import type { AppNotification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
  }
}

export function RealTimeNotifications() {
  const { user } = useEnhancedUser();
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    refreshNotifications,
    openNotification,
  } = useNotifications();

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">Assignments, courses & updates</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Refresh notifications"
              onClick={() => void refreshNotifications()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={markAllAsRead}
              >
                Mark read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-muted-foreground">
                <Bell className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="mt-1 text-xs">No pending assignments or alerts right now.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <motion.li
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      !notification.read && "bg-muted/40",
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => openNotification(notification)}
                    >
                      <NotificationIcon type={notification.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{notification.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          {formatRelativeTime(notification.timestamp)}
                          {notification.action && (
                            <span className="ml-2 text-primary">{notification.action.label} →</span>
                          )}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                    <div className="flex justify-end gap-1 px-3 pb-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px]"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Dismiss"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAll}>
              Clear all
            </Button>
            <span className="text-[10px] text-muted-foreground">
              {unreadCount} unread · {notifications.length} total
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
