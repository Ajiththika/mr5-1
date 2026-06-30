"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IdentityNotification, LeaderboardFeed } from "@/types/identity";
import {
	fetchIdentityNotifications,
	fetchLeaderboardFeed,
	markAllIdentityNotificationsRead,
	markIdentityNotificationRead,
} from "@/services/identity.service";

type FeedTab = "global" | "friends" | "personal";

export function useIdentityFeed() {
	const [tab, setTab] = useState<FeedTab>("personal");
	const [notifications, setNotifications] = useState<IdentityNotification[]>([]);
	const [leaderboard, setLeaderboard] = useState<LeaderboardFeed | null>(null);
	const [loading, setLoading] = useState(false);

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const [items, board] = await Promise.all([
				fetchIdentityNotifications(tab),
				tab === "global" ? fetchLeaderboardFeed() : Promise.resolve(null),
			]);
			setNotifications(items);
			setLeaderboard(board);
		} catch {
			setNotifications([]);
			setLeaderboard(null);
		} finally {
			setLoading(false);
		}
	}, [tab]);

	useEffect(() => {
		void refresh();
		const timer = window.setInterval(() => void refresh(), 60_000);
		return () => window.clearInterval(timer);
	}, [refresh]);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const markRead = async (id: string) => {
		await markIdentityNotificationRead(id);
		setNotifications((rows) => rows.map((row) => (row._id === id ? { ...row, read: true } : row)));
	};

	const markAllRead = async () => {
		await markAllIdentityNotificationsRead(tab);
		setNotifications((rows) => rows.map((row) => ({ ...row, read: true })));
	};

	return { tab, setTab, notifications, leaderboard, loading, unreadCount, refresh, markRead, markAllRead };
}

type IdentityFeedPanelProps = {
	tab: FeedTab;
	setTab: (tab: FeedTab) => void;
	notifications: IdentityNotification[];
	leaderboard: LeaderboardFeed | null;
	loading: boolean;
	onMarkRead: (id: string) => void;
};

export function IdentityFeedPanel({
	tab,
	setTab,
	notifications,
	leaderboard,
	loading,
	onMarkRead,
}: IdentityFeedPanelProps) {
	return (
		<div className="space-y-3">
			<div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
				{(["global", "friends", "personal"] as FeedTab[]).map((key) => (
					<button
						key={key}
						type="button"
						onClick={() => setTab(key)}
						className={cn(
							"touch-target-inline flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors",
							tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
						)}
					>
						{key}
					</button>
				))}
			</div>

			{loading ? <p className="px-1 text-xs text-muted-foreground">Loading…</p> : null}

			{tab === "global" && leaderboard ? (
				<div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
					<p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						<Trophy className="h-3.5 w-3.5" />
						Top learners
					</p>
					{leaderboard.topLearners.slice(0, 5).map((row) => (
						<div key={row.uid || row.rank} className="flex items-center justify-between text-sm">
							<span>
								🥇 #{row.rank} {row.name}
							</span>
							<span className="text-muted-foreground">{row.xp} XP</span>
						</div>
					))}
					{leaderboard.streakLeaders.slice(0, 3).map((row) => (
						<p key={row.uid} className="text-xs text-muted-foreground">
							🔥 {row.name}: {row.studyStreak} day streak
						</p>
					))}
				</div>
			) : null}

			<ul className="max-h-64 space-y-1 overflow-y-auto">
				{notifications.length === 0 && !loading ? (
					<li className="px-2 py-4 text-center text-xs text-muted-foreground">
						{tab === "friends" ? "No friend activity yet." : "No notifications yet."}
					</li>
				) : null}
				{notifications.map((item) => (
					<li key={item._id}>
						<button
							type="button"
							onClick={() => {
								if (!item.read) void onMarkRead(item._id);
								if (item.href) window.location.href = item.href;
							}}
							className={cn(
								"flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent",
								!item.read && "bg-primary/5",
							)}
						>
							<span className="text-sm font-medium">{item.title}</span>
							<span className="text-xs text-muted-foreground">{item.message}</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export function IdentityFeedIcons({ tab }: { tab: FeedTab }) {
	if (tab === "global") return <Globe className="h-3.5 w-3.5" />;
	if (tab === "friends") return <Users className="h-3.5 w-3.5" />;
	return <Trophy className="h-3.5 w-3.5" />;
}
