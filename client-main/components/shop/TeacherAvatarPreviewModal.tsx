"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { TeacherAvatarItem } from "@/services/teacher-avatar.service";
import { Loader2, Star } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const TeacherAvatarPreviewScene = dynamic(
	() =>
		import("@/components/shop/TeacherAvatarPreviewScene").then(
			(m) => m.TeacherAvatarPreviewScene,
		),
	{ ssr: false },
);

export function TeacherAvatarPreviewModal({
	teacher,
	open,
	onOpenChange,
}: {
	teacher: TeacherAvatarItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!teacher) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl border-border/80 bg-card p-0 overflow-hidden">
				<DialogHeader className="space-y-2 p-6 pb-0">
					<DialogTitle className="flex items-center gap-2 text-xl">
						{teacher.name}
						{teacher.isPremium && (
							<Badge className="border-amber-400/40 bg-amber-500/15 text-amber-200">
								Premium
							</Badge>
						)}
					</DialogTitle>
					<div className="flex items-center gap-1 text-amber-400">
						{Array.from({ length: teacher.rating ?? 5 }).map((_, i) => (
							<Star key={i} className="h-3.5 w-3.5 fill-current" />
						))}
					</div>
				</DialogHeader>

				<div className="relative mx-6 mt-4 h-72 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/40 to-muted">
					<Suspense
						fallback={
							<div className="flex h-full items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						}
					>
						<Canvas camera={{ position: [0, 1.55, 2.8], fov: 42 }}>
							<TeacherAvatarPreviewScene modelUrl={teacher.modelUrl} />
						</Canvas>
					</Suspense>
					<p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
						Drag to rotate · Scroll to zoom
					</p>
				</div>

				<div className="space-y-3 p-6 pt-4">
					<p className="text-sm leading-relaxed text-muted-foreground">{teacher.description}</p>
					{teacher.expertise?.length ? (
						<div className="flex flex-wrap gap-2">
							{teacher.expertise.map((tag) => (
								<Badge key={tag} variant="outline" className="text-xs">
									{tag}
								</Badge>
							))}
						</div>
					) : null}
					{teacher.greeting && (
						<blockquote className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm italic text-foreground/85">
							&ldquo;{teacher.greeting}&rdquo;
						</blockquote>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
