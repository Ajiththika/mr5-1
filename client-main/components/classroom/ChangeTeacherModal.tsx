"use client";

import { useEffect, useState } from "react";
import { Check, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveTeacher } from "@/contexts/ActiveTeacherContext";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { teacherAvatarService } from "@/services/teacher-avatar.service";

export function ChangeTeacherModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { user } = useEnhancedUser();
	const {
		catalog,
		ownedSlugs,
		activeTeacherSlug,
		setCatalog,
		setOwned,
		setActiveTeacher,
	} = useActiveTeacher();
	const [loading, setLoading] = useState(false);
	const [switching, setSwitching] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		const load = async () => {
			setLoading(true);
			try {
				const [catalogRes, ownedRes] = await Promise.all([
					teacherAvatarService.getCatalog(),
					user ? teacherAvatarService.getOwned() : Promise.resolve(null),
				]);
				setCatalog(catalogRes.data ?? []);
				if (ownedRes?.data) {
					setOwned(ownedRes.data.owned, ownedRes.data.activeTeacherAvatar);
				}
			} catch {
				toast.error("Could not load teachers");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [open, setCatalog, setOwned, user]);

	const handleSelect = async (slug: string, owned: boolean) => {
		if (!owned) {
			toast.message("Purchase this teacher in the Own Store first.");
			return;
		}
		if (!user) {
			setActiveTeacher(slug);
			toast.success("Teacher updated for this session");
			onOpenChange(false);
			return;
		}
		setSwitching(slug);
		try {
			await teacherAvatarService.setActive(slug);
			setActiveTeacher(slug);
			toast.success("Teacher changed");
			onOpenChange(false);
		} catch {
			toast.error("Could not switch teacher");
		} finally {
			setSwitching(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md border-border/80">
				<DialogHeader>
					<DialogTitle>Change Teacher</DialogTitle>
				</DialogHeader>
				{loading ? (
					<div className="flex justify-center py-10">
						<Loader2 className="h-7 w-7 animate-spin text-primary" />
					</div>
				) : (
					<ul className="space-y-2">
						{catalog.map((teacher) => {
							const owned =
								ownedSlugs.includes(teacher.teacherSlug) || !teacher.isPremium;
							const active = teacher.teacherSlug === activeTeacherSlug;
							return (
								<li key={teacher._id}>
									<button
										type="button"
										disabled={switching === teacher.teacherSlug}
										onClick={() => handleSelect(teacher.teacherSlug, owned)}
										className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
											active
												? "border-primary/40 bg-primary/10"
												: "border-border/70 hover:bg-muted/50"
										}`}
									>
										<div>
											<p className="font-medium">{teacher.name}</p>
											<p className="text-xs text-muted-foreground line-clamp-1">
												{teacher.personality}
											</p>
										</div>
										{active ? (
											<Badge className="gap-1">
												<Check className="h-3 w-3" />
												Active
											</Badge>
										) : owned ? (
											<span className="text-xs text-muted-foreground">Select</span>
										) : (
											<Badge variant="outline" className="gap-1 text-muted-foreground">
												<Lock className="h-3 w-3" />
												Locked
											</Badge>
										)}
									</button>
								</li>
							);
						})}
					</ul>
				)}
				<Button variant="outline" className="w-full" asChild>
					<a href="/avatar-shop">Browse Own Store</a>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
