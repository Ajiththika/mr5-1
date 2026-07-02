"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
	Award,
	BarChart3,
	BookOpenCheck,
	CalendarDays,
	Flame,
	Lock,
	ShieldCheck,
	Sparkles,
	Trophy,
	UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PublicProfile } from "@/types/identity";
import Link from "next/link";
import { fetchPublicProfile, sendFriendRequest, respondFriendRequest } from "@/services/identity.service";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { normalizeMr5Uid } from "@/lib/identity/uid";
import { parseApiError } from "@/lib/errorHandler";

const BADGE_ICONS: Record<string, ReactNode> = {
	sparkles: <Sparkles className="h-4 w-4" aria-hidden />,
	code: <Award className="h-4 w-4" aria-hidden />,
	"calendar-check": <CalendarDays className="h-4 w-4" aria-hidden />,
	trophy: <Trophy className="h-4 w-4" aria-hidden />,
	"heart-handshake": <UserPlus className="h-4 w-4" aria-hidden />,
	rocket: <Sparkles className="h-4 w-4" aria-hidden />,
};

type PublicProfileViewProps = {
	profile: PublicProfile;
};

export function PublicProfileView({ profile: initialProfile }: PublicProfileViewProps) {
	const { user } = useEnhancedUser();
	const [profile, setProfile] = useState(initialProfile);
	const [friendStatus, setFriendStatus] = useState<string | null>(null);
	const [pending, setPending] = useState(initialProfile.friendPending);
	const [isFriend, setIsFriend] = useState(Boolean(initialProfile.isFriend));

	useEffect(() => {
		setProfile(initialProfile);
		setPending(initialProfile.friendPending);
		setIsFriend(Boolean(initialProfile.isFriend));
	}, [initialProfile]);

	useEffect(() => {
		if (!user?.id) return;
		let active = true;
		void fetchPublicProfile(initialProfile.uid)
			.then((next) => {
				if (!active) return;
				setProfile(next);
				setPending(next.friendPending);
				setIsFriend(Boolean(next.isFriend));
			})
			.catch(() => undefined);
		return () => {
			active = false;
		};
	}, [user?.id, initialProfile.uid]);

	const isOwnProfile =
		profile.isOwner ||
		Boolean(
			user?.mr5Uid &&
				normalizeMr5Uid(user.mr5Uid) &&
				normalizeMr5Uid(user.mr5Uid) === normalizeMr5Uid(profile.uid),
		);
	const initials = profile.name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const handleFriendRequest = async () => {
		if (isOwnProfile) {
			setFriendStatus("This is your profile.");
			return;
		}
		try {
			await sendFriendRequest(profile.uid);
			setPending("outgoing");
			setFriendStatus("Friend request sent.");
		} catch (error) {
			setFriendStatus(parseApiError(error));
		}
	};

	const handleAcceptRequest = async () => {
		if (!profile.friendRequestId) return;
		try {
			await respondFriendRequest(profile.friendRequestId, "accept");
			setIsFriend(true);
			setPending(null);
			setFriendStatus("You are now friends.");
		} catch (error) {
			setFriendStatus(parseApiError(error));
		}
	};

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
			<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
				<div
					className="relative h-40 bg-gradient-to-r from-primary/20 via-purple-500/15 to-blue-500/20 md:h-52"
					style={
						profile.coverImage
							? {
									backgroundImage: `url(${profile.coverImage})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}
							: undefined
					}
				>
					<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
				</div>

				<div className="relative px-5 pb-6 md:px-8">
					<div className="-mt-12 flex flex-col gap-4 md:-mt-14 md:flex-row md:items-end md:justify-between">
						<div className="flex items-end gap-4">
							<Avatar className="size-24 border-4 border-background shadow-md md:size-28">
								{profile.profileImage ? (
									<AvatarImage src={profile.profileImage} alt={profile.name} />
								) : null}
								<AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
							</Avatar>
							<div className="pb-1">
								<h1 className="text-2xl font-bold tracking-tight md:text-3xl">{profile.name}</h1>
								<p className="mt-1 font-mono text-sm text-muted-foreground">{profile.uid}</p>
								<div className="mt-2 flex flex-wrap items-center gap-2">
									<Badge variant="secondary">{profile.roleLabel}</Badge>
									<Badge variant="outline">
										Joined {new Date(profile.joinedAt).toLocaleDateString()}
									</Badge>
									<Badge variant="outline" className="capitalize">
										{profile.visibility.replace("_", " ")}
									</Badge>
								</div>
							</div>
						</div>

						{!isOwnProfile && !profile.private ? (
							<div className="flex flex-col items-start gap-2 md:items-end">
								{isFriend ? (
									<Button variant="secondary" disabled>
										<UserPlus className="mr-2 h-4 w-4" />
										Friends
									</Button>
								) : pending === "incoming" ? (
									<Button onClick={handleAcceptRequest}>
										<UserPlus className="mr-2 h-4 w-4" />
										Accept Friend Request
									</Button>
								) : pending === "outgoing" ? (
									<Button variant="outline" disabled>
										Request Pending
									</Button>
								) : pending !== "blocked" ? (
									<Button variant="outline" onClick={handleFriendRequest}>
										<UserPlus className="mr-2 h-4 w-4" />
										Add Friend
									</Button>
								) : null}
								{friendStatus ? (
									<p className="text-xs text-muted-foreground">{friendStatus}</p>
								) : null}
							</div>
						) : null}
					</div>

					{profile.private ? (
						<div className="mt-8 flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-5">
							<Lock className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
							<div>
								<p className="font-medium">{profile.message || "This profile is restricted."}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									MR5 never exposes email, phone, payment data, or internal database IDs on public
									profiles.
								</p>
							</div>
						</div>
					) : (
						<div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
							<StatCard
								label="Level"
								value={profile.level ?? "—"}
								icon={<BarChart3 className="h-4 w-4" />}
							/>
							<StatCard label="XP" value={profile.xp ?? "—"} icon={<Sparkles className="h-4 w-4" />} />
							<StatCard
								label="Study streak"
								value={profile.studyStreak ?? "—"}
								icon={<Flame className="h-4 w-4" />}
							/>
							<StatCard
								label="Consistency"
								value={
									profile.consistencyScore !== undefined
										? `${profile.consistencyScore}%`
										: "—"
								}
								icon={<ShieldCheck className="h-4 w-4" />}
							/>
						</div>
					)}
				</div>
			</div>

			{!profile.private ? (
				<div className="mt-6 grid gap-6 lg:grid-cols-2">
					<SectionCard title="Completed courses" icon={<BookOpenCheck className="h-5 w-5" />}>
						<p className="text-3xl font-bold">{profile.completedCourses ?? 0}</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Courses marked complete on MR5.
						</p>
					</SectionCard>

					<SectionCard title="Badges" icon={<Trophy className="h-5 w-5" />}>
						{profile.badges?.length ? (
							<ul className="space-y-3">
								{profile.badges.map((badge) => (
									<li
										key={badge.id}
										className="flex items-start gap-3 rounded-lg border border-border p-3"
									>
										<div className="rounded-full bg-primary/10 p-2 text-primary">
											{BADGE_ICONS[badge.icon] || <Award className="h-4 w-4" />}
										</div>
										<div>
											<p className="font-medium">{badge.name}</p>
											<p className="text-sm text-muted-foreground">{badge.description}</p>
										</div>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">No badges earned yet.</p>
						)}
					</SectionCard>

					<SectionCard title="Certificates" icon={<Award className="h-5 w-5" />}>
						{profile.certificates?.length ? (
							<ul className="space-y-3">
								{profile.certificates.map((cert) => (
									<li key={cert.verificationId} className="rounded-lg border border-border p-3">
										<p className="font-medium">{cert.title}</p>
										<p className="text-xs text-muted-foreground">
											Issued {new Date(cert.issuedAt).toLocaleDateString()}
										</p>
										<Link
											href={cert.verifyHref}
											className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
										>
											Verify certificate
										</Link>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">No certificates to display.</p>
						)}
					</SectionCard>

					<SectionCard title="Projects" icon={<Sparkles className="h-5 w-5" />}>
						{profile.projects?.length ? (
							<ul className="space-y-3">
								{profile.projects.map((project, index) => (
									<li key={`${project.title}-${index}`} className="rounded-lg border border-border p-3">
										<p className="font-medium">{project.title}</p>
										{project.summary ? (
											<p className="text-sm text-muted-foreground">{project.summary}</p>
										) : null}
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">Projects will appear here.</p>
						)}
					</SectionCard>

					<SectionCard title="Achievements" icon={<Trophy className="h-5 w-5" />} className="lg:col-span-2">
						{profile.achievements?.length ? (
							<ul className="grid gap-3 md:grid-cols-2">
								{profile.achievements.map((item, index) => (
									<li key={`${item.title}-${index}`} className="rounded-lg border border-border p-3">
										<p className="font-medium">{item.title}</p>
										{item.description ? (
											<p className="text-sm text-muted-foreground">{item.description}</p>
										) : null}
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">Achievements will appear here.</p>
						)}
					</SectionCard>
				</div>
			) : null}

			{profile.qrIdentityReady ? (
				<p className="mt-8 text-center text-xs text-muted-foreground">
					QR identity and academic passport support are enabled for this MR5 profile.
				</p>
			) : null}
		</div>
	);
}

function StatCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: string | number;
	icon: ReactNode;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-bold">{value}</p>
			</CardContent>
		</Card>
	);
}

function SectionCard({
	title,
	icon,
	children,
	className,
}: {
	title: string;
	icon: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					{icon}
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
