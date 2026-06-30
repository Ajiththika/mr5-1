"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { useActiveTeacher } from "@/contexts/ActiveTeacherContext";
import { teacherAvatarService } from "@/services/teacher-avatar.service";
import {
	ownStoreService,
	productSlug,
	type OwnStoreInventory,
	type OwnStoreProduct,
} from "@/services/own-store.service";

function InventorySection({
	title,
	items,
	onEquip,
	onUnequip,
	acting,
}: {
	title: string;
	items: OwnStoreProduct[];
	onEquip?: (slug: string) => void;
	onUnequip?: (slug: string) => void;
	acting: string | null;
}) {
	const owned = items.filter((item) => item.owned);
	if (owned.length === 0) return null;

	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
				{title}
			</h3>
			<div className="space-y-2">
				{owned.map((item) => {
					const slug = productSlug(item);
					const equipped = item.equipped;
					return (
						<div
							key={slug}
							className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-lg">
									<Check className="h-4 w-4 text-amber-400" />
								</div>
								<div>
									<p className="font-medium">{item.name}</p>
									{item.equipped && (
										<Badge
											variant="outline"
											className="mt-1 border-amber-400/30 text-amber-300"
										>
											Equipped
										</Badge>
									)}
								</div>
							</div>
							<div className="flex gap-2">
								{onEquip && !equipped && (
									<Button
										size="sm"
										disabled={acting === slug}
										onClick={() => onEquip(slug)}
									>
										{item.type === "audio_pack" ? "Use" : "Equip"}
									</Button>
								)}
								{onUnequip && equipped && (
									<Button
										size="sm"
										variant="outline"
										disabled={acting === slug}
										onClick={() => onUnequip(slug)}
									>
										Remove
									</Button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function OwnStoreInventoryPanel({
	refreshKey = 0,
}: {
	refreshKey?: number;
}) {
	const { user } = useEnhancedUser();
	const { setActiveTeacher, syncInventory } = useActiveTeacher();
	const [inventory, setInventory] = useState<OwnStoreInventory | null>(null);
	const [loading, setLoading] = useState(true);
	const [acting, setActing] = useState<string | null>(null);
	const [welcomeDraft, setWelcomeDraft] = useState("");
	const [savingWelcome, setSavingWelcome] = useState(false);

	const load = useCallback(async () => {
		if (!user) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const res = await ownStoreService.getInventory();
			setInventory(res.data);
			syncInventory(res.data);
			setWelcomeDraft(res.data.welcomeMessage ?? "");
		} catch {
			toast.error("Could not load inventory");
		} finally {
			setLoading(false);
		}
	}, [user, syncInventory]);

	useEffect(() => {
		load();
	}, [load, refreshKey]);

	const handleEquip = async (slug: string, isTeacher = false) => {
		setActing(slug);
		try {
			if (isTeacher) {
				await teacherAvatarService.setActive(slug);
				setActiveTeacher(slug);
			} else {
				await ownStoreService.equip(slug);
			}
			await load();
			toast.success("Equipped successfully");
		} catch {
			toast.error("Could not equip item");
		} finally {
			setActing(null);
		}
	};

	const handleUnequip = async (slug: string) => {
		setActing(slug);
		try {
			await ownStoreService.unequip(slug);
			await load();
			toast.success("Item removed");
		} catch {
			toast.error("Could not remove item");
		} finally {
			setActing(null);
		}
	};

	const saveWelcome = async () => {
		setSavingWelcome(true);
		try {
			await ownStoreService.updateClassroomSettings(welcomeDraft.trim().slice(0, 80));
			toast.success("Welcome message saved");
			await load();
		} catch {
			toast.error("Could not save welcome message");
		} finally {
			setSavingWelcome(false);
		}
	};

	if (!user) {
		return (
			<div className="rounded-xl border border-dashed border-border/80 py-16 text-center">
				<Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
				<p className="text-sm text-muted-foreground">
					Sign in to view your inventory and equipped items.
				</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!inventory) return null;

	const teacherEquip = (slug: string) => handleEquip(slug, true);

	return (
		<div className="space-y-8 animate-in fade-in duration-300">
			<div>
				<h2 className="text-lg font-semibold tracking-tight">My Inventory</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Everything you own. Equip items for your next classroom session.
				</p>
			</div>

			<InventorySection
				title="My Teachers"
				items={inventory.teachers}
				onEquip={teacherEquip}
				acting={acting}
			/>
			<InventorySection
				title="My Classroom Items"
				items={inventory.items}
				onEquip={(slug) => handleEquip(slug)}
				onUnequip={handleUnequip}
				acting={acting}
			/>
			<InventorySection
				title="My Audio Packs"
				items={inventory.audio}
				onEquip={(slug) => handleEquip(slug)}
				onUnequip={handleUnequip}
				acting={acting}
			/>
			<InventorySection
				title="My Exercise Packs"
				items={inventory.activities}
				onEquip={(slug) => handleEquip(slug)}
				onUnequip={handleUnequip}
				acting={acting}
			/>
			<InventorySection
				title="My Transport"
				items={inventory.transport}
				onEquip={(slug) => handleEquip(slug)}
				onUnequip={handleUnequip}
				acting={acting}
			/>

			<div className="space-y-3 rounded-xl border border-border/70 bg-card/40 p-5">
				<h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
					Welcome Message
				</h3>
				<p className="text-xs text-muted-foreground">
					Plays when your classroom loads. Maximum 80 characters.
				</p>
				<textarea
					value={welcomeDraft}
					onChange={(e) => setWelcomeDraft(e.target.value.slice(0, 80))}
					rows={2}
					className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
					placeholder="Welcome to MR5 School."
				/>
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">{welcomeDraft.length}/80</span>
					<Button size="sm" disabled={savingWelcome} onClick={saveWelcome}>
						{savingWelcome ? "Saving…" : "Save"}
					</Button>
				</div>
			</div>
		</div>
	);
}
