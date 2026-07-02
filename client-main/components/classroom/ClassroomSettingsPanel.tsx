"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnStore, findOwnedItem } from "@/contexts/ActiveTeacherContext";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { ownStoreService } from "@/services/own-store.service";

export function ClassroomSettingsPanel({
	open,
	onOpenChange,
	onChangeTeacher,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onChangeTeacher: () => void;
}) {
	const { user } = useEnhancedUser();
	const {
		inventory,
		equipped,
		welcomeMessage,
		syncInventory,
		setWelcomeMessage,
		activeTeacher,
	} = useOwnStore();
	const [draftWelcome, setDraftWelcome] = useState(welcomeMessage);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) return;
		setDraftWelcome(welcomeMessage);
		if (!user) return;
		const load = async () => {
			setLoading(true);
			try {
				const res = await ownStoreService.getInventory();
				syncInventory(res.data);
			} catch {
				toast.error("Could not load classroom settings");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [open, user, welcomeMessage, syncInventory]);

	const labelFor = (slug: string, fallback: string) => {
		if (!slug) return "None equipped";
		const item = findOwnedItem(inventory, slug);
		return item?.name ?? fallback;
	};

	const handleSaveWelcome = async () => {
		const trimmed = draftWelcome.trim().slice(0, 80);
		if (!user) {
			setWelcomeMessage(trimmed || "Welcome to MR5 School.");
			toast.success("Welcome message saved for this session");
			return;
		}
		setSaving(true);
		try {
			await ownStoreService.updateClassroomSettings(trimmed);
			setWelcomeMessage(trimmed || "Welcome to MR5 School.");
			toast.success("Welcome message saved");
		} catch {
			toast.error("Could not save welcome message");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5 text-amber-400" />
						Classroom Settings
					</DialogTitle>
				</DialogHeader>

				{loading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				) : (
					<div className="space-y-6">
						<SettingRow
							label="Teacher"
							value={activeTeacher?.name ?? labelFor(equipped.teacher, "MR5 Default Teacher")}
							actionLabel="Change"
							onAction={() => {
								onOpenChange(false);
								onChangeTeacher();
							}}
						/>
						<SettingRow
							label="Desk Fan"
							value={labelFor(equipped.deskFan, "No desk fan")}
							actionLabel="Change"
							onAction={() => {
								onOpenChange(false);
								window.location.href = "/avatar-shop?tab=inventory";
							}}
						/>
						<SettingRow
							label="Clock"
							value={labelFor(equipped.clock, "Default clock")}
							actionLabel="Change"
							onAction={() => {
								onOpenChange(false);
								window.location.href = "/avatar-shop?tab=inventory";
							}}
						/>
						<SettingRow
							label="Bell Sound"
							value={labelFor(equipped.bell, "No bell pack")}
							actionLabel="Change"
							onAction={() => {
								onOpenChange(false);
								window.location.href = "/avatar-shop?tab=inventory";
							}}
						/>
						<SettingRow
							label="Campus Transport"
							value={labelFor(equipped.transport, "No bicycle or bus")}
							actionLabel="Change"
							onAction={() => {
								onOpenChange(false);
								window.location.href = "/avatar-shop?tab=transport";
							}}
						/>
						<SettingRow
							label="Background Audio"
							value={labelFor(equipped.backgroundMusic, "Silent")}
							actionLabel="Change"
							onAction={() => {
								onOpenChange(false);
								window.location.href = "/avatar-shop?tab=inventory";
							}}
						/>

						<div className="space-y-2 border-t border-border pt-4">
							<Label htmlFor="welcome-msg">Welcome Message</Label>
							<Input
								id="welcome-msg"
								maxLength={80}
								value={draftWelcome}
								onChange={(e) => setDraftWelcome(e.target.value)}
								placeholder="Welcome to MR5 School."
							/>
							<p className="text-xs text-muted-foreground">
								{draftWelcome.length}/80 characters · plays when class loads
							</p>
							<Button
								size="sm"
								disabled={saving}
								onClick={handleSaveWelcome}
							>
								{saving ? "Saving…" : "Save Welcome"}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function SettingRow({
	label,
	value,
	actionLabel,
	onAction,
}: {
	label: string;
	value: string;
	actionLabel: string;
	onAction: () => void;
}) {
	return (
		<div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
			<div>
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
				<p className="mt-1 text-sm font-medium">{value}</p>
			</div>
			<Button size="sm" variant="outline" onClick={onAction}>
				{actionLabel}
			</Button>
		</div>
	);
}
