"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Crown, Loader2, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { TeacherAvatarShopClient } from "@/components/shop/TeacherAvatarShopClient";
import { OwnStoreCategoryPanel } from "@/components/shop/OwnStoreCategoryPanel";
import { OwnStoreInventoryPanel } from "@/components/shop/OwnStoreInventoryPanel";
import { teacherAvatarService } from "@/services/teacher-avatar.service";
import { ownStoreService } from "@/services/own-store.service";
import {
	isOwnStoreTabId,
	OWN_STORE_TABS,
	readStoredTab,
	writeStoredTab,
	type OwnStoreTabId,
} from "@/lib/own-store/tabs";

function TabFallback() {
	return (
		<div className="flex justify-center py-20">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
		</div>
	);
}

export function OwnStoreClient() {
	const { user } = useEnhancedUser();
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState<OwnStoreTabId>("teachers");
	const [inventoryKey, setInventoryKey] = useState(0);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const urlTab = searchParams.get("tab");
		if (isOwnStoreTabId(urlTab)) {
			setActiveTab(urlTab);
			writeStoredTab(urlTab);
		} else {
			setActiveTab(readStoredTab());
		}
		setHydrated(true);
	}, [searchParams]);

	const handleTabChange = (value: string) => {
		if (!isOwnStoreTabId(value)) return;
		setActiveTab(value);
		writeStoredTab(value);
	};

	const refreshInventory = useCallback(() => {
		setInventoryKey((k) => k + 1);
	}, []);

	useEffect(() => {
		const purchase = searchParams.get("purchase");
		const sessionId = searchParams.get("session_id");
		if (!user || purchase !== "success") return;

		const verify = async () => {
			try {
				if (sessionId) {
					try {
						await ownStoreService.verifyPurchase(sessionId);
					} catch {
						await teacherAvatarService.verifyPurchase(sessionId);
					}
				}
				refreshInventory();
				toast.success("Purchase complete! Check your inventory.");
			} catch {
				toast.error("Purchase verification failed");
			}
		};
		verify();
	}, [searchParams, user, refreshInventory]);

	if (!hydrated) {
		return <TabFallback />;
	}

	return (
		<div className="space-y-8">
			<div className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-500/8 via-card to-indigo-500/8 p-6 md:p-8">
				<div className="flex flex-wrap items-center gap-3">
					<Crown className="h-6 w-6 text-amber-300" />
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl">MR5 Own Store</h1>
				</div>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
					Purchase teachers, classroom upgrades, audio packs, and activities. Everything
					you own lives in Inventory — equip items anytime without losing progress.
				</p>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="gap-6"
			>
				<div className="overflow-x-auto pb-1">
					<TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap gap-1 bg-muted/60 p-1.5 sm:min-w-0">
						{OWN_STORE_TABS.map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className="shrink-0 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
							>
								{tab.id === "inventory" && (
									<Sparkles className="mr-1 h-3.5 w-3.5 text-amber-400" />
								)}
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				<TabsContent value="teachers" className="mt-0 animate-in fade-in duration-300">
					<Suspense fallback={<TabFallback />}>
						<TeacherAvatarShopClient embedded />
					</Suspense>
				</TabsContent>

				<TabsContent value="classroom" className="mt-0">
					<OwnStoreCategoryPanel
						category="classroom"
						title="Classroom Items"
						description="Upgrade your 3D classroom with clocks, lighting packs, and more."
						onInventoryRefresh={refreshInventory}
					/>
				</TabsContent>

				<TabsContent value="audio" className="mt-0">
					<OwnStoreCategoryPanel
						category="audio"
						title="Classroom Sounds"
						description="Bell packs, focus music, and welcome voice lines for your sessions."
						onInventoryRefresh={refreshInventory}
					/>
				</TabsContent>

				<TabsContent value="activities" className="mt-0">
					<OwnStoreCategoryPanel
						category="activities"
						title="Activities & Exercises"
						description="Unlock quizzes, group work, practical tasks, and AI-generated assignments."
						onInventoryRefresh={refreshInventory}
					/>
				</TabsContent>

				<TabsContent value="transport" className="mt-0">
					<OwnStoreCategoryPanel
						category="transport"
						title="School Transport"
						description="Free bicycles for cycle lovers, plus premium school bus outside your classroom window."
						onInventoryRefresh={refreshInventory}
					/>
				</TabsContent>

				<TabsContent value="inventory" className="mt-0">
					<OwnStoreInventoryPanel refreshKey={inventoryKey} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
