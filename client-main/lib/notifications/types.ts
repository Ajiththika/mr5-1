export type AppNotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  timestamp: Date;
  read: boolean;
  href?: string;
  action?: {
    label: string;
    href: string;
  };
}

export type NotificationInput = Omit<AppNotification, "timestamp" | "read"> & {
  skipSound?: boolean;
  skipToast?: boolean;
};
