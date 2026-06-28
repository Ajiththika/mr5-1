"use client";

import Link from "next/link";
import { Shield, Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalAcademicSearch } from "@/components/identity/GlobalAcademicSearch";
import { Button } from "@/components/ui/button";

export default function AdminIdentityPage() {
	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Academic Identity</h1>
				<p className="text-sm text-muted-foreground">
					Search MR5 UIDs, review public profiles, and moderate identity visibility.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Search className="h-5 w-5" />
							UID & profile search
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<GlobalAcademicSearch
							showShortcut={false}
							placeholder="MR5-STU-XXXXXX, teacher name, course…"
							onNavigate={() => {}}
						/>
						<p className="text-xs text-muted-foreground">
							Search respects profile privacy. Private profiles are hidden from name search.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Shield className="h-5 w-5" />
							Moderation tools
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>• Certificate verification at <code>/certificate/CERT-XXXXXX</code></p>
						<p>• Public profiles at <code>/u/MR5-STU-XXXXXX</code></p>
						<p>• Users control visibility from Profile → Privacy panel</p>
						<p>• Friend requests and community feeds are audit-logged server-side</p>
						<div className="flex flex-wrap gap-2 pt-2">
							<Button asChild variant="outline" size="sm">
								<Link href="/admin/users">User accounts</Link>
							</Button>
							<Button asChild variant="outline" size="sm">
								<Link href="/admin/approvals">Content approvals</Link>
							</Button>
							<Button asChild variant="outline" size="sm">
								<Link href="/admin/activity">Activity log</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Users className="h-5 w-5" />
							Identity system status
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<StatusTile label="MR5 UIDs" value="Active" />
						<StatusTile label="Privacy enforcement" value="On" />
						<StatusTile label="Certificate verify" value="Public" />
						<StatusTile label="Search rate limit" value="60/min" />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function StatusTile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="text-lg font-semibold">{value}</p>
		</div>
	);
}
