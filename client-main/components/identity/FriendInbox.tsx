"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IdentityFriendRecord } from "@/types/identity";
import {
	fetchFriendRequests,
	respondFriendRequest,
} from "@/services/identity.service";
import { profilePath } from "@/lib/identity/uid";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";

export function FriendInbox() {
	const { user } = useEnhancedUser();
	const [rows, setRows] = useState<IdentityFriendRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			setRows(await fetchFriendRequests());
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Unable to load friends.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const respond = async (requestId: string, action: "accept" | "decline" | "block") => {
		setMessage(null);
		try {
			await respondFriendRequest(requestId, action);
			setMessage(action === "accept" ? "Friend request accepted." : "Request updated.");
			await load();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Action failed.");
		}
	};

	const pending = rows.filter((row) => row.status === "pending");
	const friends = rows.filter((row) => row.status === "accepted");

	const pendingIncoming = pending.filter(
		(row) => user?.id && String(row.recipient._id) === String(user.id),
	);
	const pendingOutgoing = pending.filter(
		(row) => user?.id && String(row.requester._id) === String(user.id),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<UserPlus className="h-5 w-5" />
					Friends
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{loading ? <p className="text-sm text-muted-foreground">Loading friends…</p> : null}
				{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

				<section className="space-y-3">
					<h3 className="text-sm font-semibold">Incoming requests</h3>
					{pendingIncoming.length === 0 && !loading ? (
						<p className="text-sm text-muted-foreground">No pending requests.</p>
					) : null}
					{pendingIncoming.map((row) => {
						const other = row.requester;
						return (
							<FriendRow
								key={row._id}
								name={other.name}
								uid={other.mr5Uid}
								image={other.profileImage || other.avatarUrl}
								actions={
									<>
										<Button size="sm" onClick={() => void respond(row._id, "accept")}>
											<Check className="mr-1 h-4 w-4" />
											Accept
										</Button>
										<Button size="sm" variant="outline" onClick={() => void respond(row._id, "decline")}>
											<X className="mr-1 h-4 w-4" />
											Decline
										</Button>
									</>
								}
							/>
						);
					})}
				</section>

				{pendingOutgoing.length ? (
					<section className="space-y-3">
						<h3 className="text-sm font-semibold">Sent requests</h3>
						{pendingOutgoing.map((row) => {
							const other = row.recipient;
							return (
								<FriendRow
									key={row._id}
									name={other.name}
									uid={other.mr5Uid}
									image={other.profileImage || other.avatarUrl}
									actions={<span className="text-xs text-muted-foreground">Pending</span>}
								/>
							);
						})}
					</section>
				) : null}

				<section className="space-y-3">
					<h3 className="text-sm font-semibold">Your friends</h3>
					{friends.length === 0 && !loading ? (
						<p className="text-sm text-muted-foreground">No friends yet. Search MR5 UIDs to connect.</p>
					) : null}
					{friends.map((row) => {
						const other =
							user?.id && String(row.requester._id) === String(user.id)
								? row.recipient
								: row.requester;
						return (
							<FriendRow
								key={row._id}
								name={other.name}
								uid={other.mr5Uid}
								image={other.profileImage || other.avatarUrl}
								actions={
									<Button asChild size="sm" variant="outline">
										<Link href={profilePath(other.mr5Uid)}>View profile</Link>
									</Button>
								}
							/>
						);
					})}
				</section>
			</CardContent>
		</Card>
	);
}

function FriendRow({
	name,
	uid,
	image,
	actions,
}: {
	name: string;
	uid: string;
	image?: string;
	actions: ReactNode;
}) {
	const initials = name
		.split(" ")
		.map((p) => p[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
			<div className="flex min-w-0 items-center gap-3">
				<Avatar className="size-10">
					{image ? <AvatarImage src={image} alt={name} /> : null}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{name}</p>
					<p className="truncate font-mono text-xs text-muted-foreground">{uid}</p>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2">{actions}</div>
		</div>
	);
}
