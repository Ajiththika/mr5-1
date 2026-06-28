"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { PrivacySettings, ProfileVisibility } from "@/types/identity";
import {
	fetchMyPrivacySettings,
	updateMyPrivacySettings,
} from "@/services/identity.service";
import { profilePath } from "@/lib/identity/uid";

type IdentityPrivacyPanelProps = {
	mr5Uid?: string;
};

export function IdentityPrivacyPanel({ mr5Uid }: IdentityPrivacyPanelProps) {
	const [settings, setSettings] = useState<PrivacySettings | null>(null);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		fetchMyPrivacySettings()
			.then(setSettings)
			.catch(() => setMessage("Unable to load privacy settings."));
	}, []);

	const update = async (patch: Partial<PrivacySettings>) => {
		if (!settings) return;
		const next = { ...settings, ...patch };
		setSettings(next);
		setSaving(true);
		setMessage(null);
		try {
			const saved = await updateMyPrivacySettings(patch);
			setSettings(saved);
			setMessage("Privacy settings saved.");
		} catch {
			setSettings(settings);
			setMessage("Failed to save privacy settings.");
		} finally {
			setSaving(false);
		}
	};

	if (!settings) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Shield className="h-5 w-5" />
						Public profile privacy
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Loading privacy controls…</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Shield className="h-5 w-5" />
					Public profile privacy
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				{mr5Uid ? (
					<div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
						<p className="font-medium">Your MR5 UID</p>
						<p className="mt-1 font-mono text-muted-foreground">{mr5Uid}</p>
						<Button asChild variant="link" className="mt-2 h-auto p-0">
							<Link href={profilePath(mr5Uid)}>View public profile</Link>
						</Button>
					</div>
				) : null}

				<div className="space-y-2">
					<Label htmlFor="profile-visibility">Profile visibility</Label>
					<Select
						value={settings.profileVisibility}
						onValueChange={(value: ProfileVisibility) =>
							void update({ profileVisibility: value })
						}
					>
						<SelectTrigger id="profile-visibility">
							<SelectValue placeholder="Choose visibility" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="public">Public</SelectItem>
							<SelectItem value="friends_only">Friends only</SelectItem>
							<SelectItem value="private">Private</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-3">
					<PrivacyToggle
						id="show-xp"
						label="Show XP & level"
						checked={settings.showXp}
						onCheckedChange={(checked) => void update({ showXp: checked })}
					/>
					<PrivacyToggle
						id="show-streak"
						label="Show streak & consistency"
						checked={settings.showStreak}
						onCheckedChange={(checked) => void update({ showStreak: checked })}
					/>
					<PrivacyToggle
						id="show-badges"
						label="Show badges"
						checked={settings.showBadges}
						onCheckedChange={(checked) => void update({ showBadges: checked })}
					/>
					<PrivacyToggle
						id="show-certificates"
						label="Show certificates"
						checked={settings.showCertificates}
						onCheckedChange={(checked) => void update({ showCertificates: checked })}
					/>
					<PrivacyToggle
						id="show-courses"
						label="Show completed courses count"
						checked={settings.showCourses}
						onCheckedChange={(checked) => void update({ showCourses: checked })}
					/>
					<PrivacyToggle
						id="show-projects"
						label="Show projects"
						checked={settings.showProjects}
						onCheckedChange={(checked) => void update({ showProjects: checked })}
					/>
					<PrivacyToggle
						id="show-achievements"
						label="Show achievements"
						checked={settings.showAchievements}
						onCheckedChange={(checked) => void update({ showAchievements: checked })}
					/>
				</div>

				<p className="text-xs text-muted-foreground">
					Email, phone, passwords, payment data, and internal database IDs are never shown on
					public MR5 profiles.
				</p>
				{message ? <p className="text-sm text-muted-foreground">{saving ? "Saving…" : message}</p> : null}
			</CardContent>
		</Card>
	);
}

function PrivacyToggle({
	id,
	label,
	checked,
	onCheckedChange,
}: {
	id: string;
	label: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
			<div className="flex items-center gap-2 text-sm">
				{checked ? (
					<Eye className="h-4 w-4 text-primary" aria-hidden />
				) : (
					<EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden />
				)}
				<Label htmlFor={id}>{label}</Label>
			</div>
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}
