"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
	Check,
	Crown,
	Loader2,
	Lock,
	Sparkles,
	Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { useActiveTeacher } from "@/contexts/ActiveTeacherContext";
import {
	teacherAvatarService,
	type TeacherAvatarItem,
} from "@/services/teacher-avatar.service";
import { TeacherAvatarPreviewModal } from "@/components/shop/TeacherAvatarPreviewModal";

function formatPrice(cents: number) {
	if (cents <= 0) return "Free";
	return `$${(cents / 100).toFixed(2)}`;
}

function TeacherCard({
	teacher,
	owned,
	purchasing,
	onPreview,
	onBuy,
}: {
	teacher: TeacherAvatarItem;
	owned: boolean;
	purchasing: boolean;
	onPreview: () => void;
	onBuy: () => void;
}) {
	return (
		<Card className="group overflow-hidden border-border/80 bg-card/90 transition-shadow hover:shadow-lg">
			<CardHeader className="space-y-3 pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/15 to-indigo-500/10 text-2xl">
						{teacher.isPremium ? "⭐" : "✓"}
					</div>
					{teacher.isPremium ? (
						<Badge className="border-amber-400/30 bg-amber-500/10 text-amber-200">
							<Crown className="mr-1 h-3 w-3" />
							Premium
						</Badge>
					) : (
						<Badge variant="outline">Free</Badge>
					)}
				</div>
				<div>
					<CardTitle className="text-lg">{teacher.name}</CardTitle>
					<div className="mt-1 flex items-center gap-1 text-amber-400">
						{Array.from({ length: teacher.rating ?? 5 }).map((_, i) => (
							<Star key={i} className="h-3 w-3 fill-current" />
						))}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
					{teacher.description}
				</p>
				{teacher.expertise?.length ? (
					<div className="flex flex-wrap gap-1.5">
						{teacher.expertise.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-[10px]">
								{tag}
							</Badge>
						))}
					</div>
				) : null}
				<div className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
					<span className="text-xl font-bold text-foreground">
						{formatPrice(teacher.priceCents)}
					</span>
					<div className="flex gap-2">
						<Button size="sm" variant="outline" onClick={onPreview}>
							Preview
						</Button>
						{owned ? (
							<Button size="sm" variant="secondary" disabled className="gap-1">
								<Check className="h-4 w-4" />
								Owned
							</Button>
						) : teacher.isPremium ? (
							<Button size="sm" disabled={purchasing} onClick={onBuy}>
								{purchasing ? "Processing…" : "Buy Now"}
							</Button>
						) : (
							<Button size="sm" variant="secondary" disabled className="gap-1">
								<Check className="h-4 w-4" />
								Included
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function TeacherAvatarShopClient({
	embedded = false,
}: {
	embedded?: boolean;
}) {
	const { user } = useEnhancedUser();
	const { setCatalog, setOwned, ownedSlugs } = useActiveTeacher();
	const searchParams = useSearchParams();
	const [teachers, setTeachers] = useState<TeacherAvatarItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [purchasing, setPurchasing] = useState<string | null>(null);
	const [previewTeacher, setPreviewTeacher] = useState<TeacherAvatarItem | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const catalogRes = await teacherAvatarService.getCatalog();
			const items = catalogRes.data ?? [];
			setTeachers(items);
			setCatalog(items);

			if (user) {
				const ownedRes = await teacherAvatarService.getOwned();
				setOwned(ownedRes.data.owned, ownedRes.data.activeTeacherAvatar);
			}
		} catch (error) {
			console.error(error);
			toast.error("Could not load teacher avatars");
		} finally {
			setLoading(false);
		}
	}, [setCatalog, setOwned, user]);

	useEffect(() => {
		load();
	}, [load]);

	useEffect(() => {
		if (embedded) return;
		const purchase = searchParams.get("purchase");
		const sessionId = searchParams.get("session_id");
		if (!user || purchase !== "success") return;

		const verify = async () => {
			try {
				if (sessionId) {
					await teacherAvatarService.verifyPurchase(sessionId);
				}
				await load();
				toast.success("Premium teacher unlocked! Use Change Teacher in class.");
			} catch {
				toast.error("Purchase verification failed");
			}
		};
		verify();
	}, [searchParams, user, load, embedded]);

	const freeTeachers = useMemo(
		() => teachers.filter((t) => !t.isPremium),
		[teachers],
	);
	const premiumTeachers = useMemo(
		() => teachers.filter((t) => t.isPremium),
		[teachers],
	);

	const handleBuy = async (teacher: TeacherAvatarItem) => {
		if (!user) {
			toast.error("Please sign in to purchase premium teachers");
			return;
		}
		setPurchasing(teacher.teacherSlug);
		try {
			const result = await teacherAvatarService.checkout(teacher.teacherSlug);
			if (result.url) {
				if (result.isDemo) {
					await load();
					toast.success(`${teacher.name} is now yours!`);
				} else {
					window.location.href = result.url;
				}
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Checkout failed";
			toast.error(message);
		} finally {
			setPurchasing(null);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center py-24">
				<Loader2 className="h-9 w-9 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-10">
			{!embedded && (
				<div className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-500/8 via-card to-indigo-500/8 p-6 md:p-8">
					<div className="flex flex-wrap items-center gap-3">
						<Sparkles className="h-6 w-6 text-amber-300" />
						<h1 className="text-2xl font-bold tracking-tight md:text-3xl">
							Premium Teacher Avatar Shop
						</h1>
					</div>
					<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
						Unlock expert AI teachers with unique personalities, teaching styles, and
						classroom presence. Purchased avatars stay yours forever and can be switched
						anytime inside the 3D classroom.
					</p>
				</div>
			)}

			<section className="space-y-4">
				<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Free Teachers
				</h2>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{freeTeachers.map((teacher) => (
						<TeacherCard
							key={teacher._id}
							teacher={teacher}
							owned
							purchasing={false}
							onPreview={() => setPreviewTeacher(teacher)}
							onBuy={() => {}}
						/>
					))}
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					<Crown className="h-4 w-4 text-amber-400" />
					Premium Teachers
				</h2>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{premiumTeachers.map((teacher) => (
						<TeacherCard
							key={teacher._id}
							teacher={teacher}
							owned={ownedSlugs.includes(teacher.teacherSlug)}
							purchasing={purchasing === teacher.teacherSlug}
							onPreview={() => setPreviewTeacher(teacher)}
							onBuy={() => handleBuy(teacher)}
						/>
					))}
				</div>
				{!user && (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<Lock className="h-4 w-4" />
						Sign in to purchase premium teachers. Stripe and PayPal supported at checkout.
					</p>
				)}
			</section>

			<TeacherAvatarPreviewModal
				teacher={previewTeacher}
				open={!!previewTeacher}
				onOpenChange={(open) => !open && setPreviewTeacher(null)}
			/>
		</div>
	);
}
