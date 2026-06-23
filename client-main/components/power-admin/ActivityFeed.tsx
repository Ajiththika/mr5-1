"use client";

import type { ActivityLogItem } from "@/lib/power-admin/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ items }: { items: ActivityLogItem[] }) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const id = item.id || item._id || item.summary;
        return (
          <li
            key={id}
            className="flex gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3"
          >
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{item.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.actor?.name ? `${item.actor.name} · ` : ""}
                {item.module} ·{" "}
                {timeAgo(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
