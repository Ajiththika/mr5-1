"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { StudentDashboardShell } from "@/components/student/StudentDashboardShell";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { OwnStoreClient } from "@/components/shop/OwnStoreClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function ShopFallback() {
	return (
		<div className="flex justify-center py-24">
			<Loader2 className="h-9 w-9 animate-spin text-primary" />
		</div>
	);
}

export default function AvatarShopPage() {
	return (
		<StudentDashboardShell>
			<StudentPageHeader
				title="MR5 Own Store"
				description="Teachers, classroom upgrades, audio packs, and your inventory — all in one place."
				actions={
					<>
						<Button variant="outline" size="sm" asChild>
							<Link href="/inventory">My Inventory</Link>
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link href="/student/portal">Back to Portal</Link>
						</Button>
					</>
				}
			/>
			<Suspense fallback={<ShopFallback />}>
				<OwnStoreClient />
			</Suspense>
		</StudentDashboardShell>
	);
}
