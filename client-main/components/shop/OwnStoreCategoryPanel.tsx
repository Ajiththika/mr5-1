"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import {
	ownStoreService,
	productSlug,
	type OwnStoreProduct,
} from "@/services/own-store.service";
import type { OwnStoreTabId } from "@/lib/own-store/tabs";
import { OwnStoreProductCard } from "@/components/shop/OwnStoreProductCard";

export function OwnStoreCategoryPanel({
	category,
	title,
	description,
	onInventoryRefresh,
}: {
	category: Exclude<OwnStoreTabId, "teachers" | "inventory">;
	title: string;
	description: string;
	onInventoryRefresh?: () => void;
}) {
	const { user } = useEnhancedUser();
	const [products, setProducts] = useState<OwnStoreProduct[]>([]);
	const [comingSoon, setComingSoon] = useState<OwnStoreProduct[]>([]);
	const [ownedMap, setOwnedMap] = useState<Record<string, boolean>>({});
	const [equippedMap, setEquippedMap] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState(true);
	const [purchasing, setPurchasing] = useState<string | null>(null);
	const [acting, setActing] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [catalogRes, inventoryRes] = await Promise.all([
				ownStoreService.getCatalog(category),
				user ? ownStoreService.getInventory() : Promise.resolve(null),
			]);

			setProducts(catalogRes.data ?? []);
			setComingSoon(catalogRes.comingSoon ?? []);

			if (inventoryRes?.data) {
				const inv = inventoryRes.data;
				const section =
					category === "classroom"
						? inv.items
						: category === "audio"
							? inv.audio
							: category === "activities"
								? inv.activities
								: inv.transport;

				const owned: Record<string, boolean> = {};
				const equipped: Record<string, boolean> = {};
				for (const item of section) {
					const slug = productSlug(item);
					if (slug) {
						owned[slug] = item.owned ?? false;
						equipped[slug] = item.equipped ?? false;
					}
				}
				setOwnedMap(owned);
				setEquippedMap(equipped);
			}
		} catch {
			toast.error("Could not load store items");
		} finally {
			setLoading(false);
		}
	}, [category, user]);

	useEffect(() => {
		load();
	}, [load]);

	const allProducts = useMemo(
		() => [...products, ...comingSoon.filter((c) => !products.some((p) => productSlug(p) === productSlug(c)))],
		[products, comingSoon],
	);

	const handleBuy = async (product: OwnStoreProduct) => {
		const slug = productSlug(product);
		if (!user) {
			toast.error("Please sign in to purchase");
			return;
		}
		setPurchasing(slug);
		try {
			const result = await ownStoreService.checkout(slug);
			if (result.url) {
				if (result.isDemo) {
					await load();
					onInventoryRefresh?.();
					toast.success(`${product.name} is now yours!`);
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

	const handleEquip = async (product: OwnStoreProduct) => {
		const slug = productSlug(product);
		setActing(slug);
		try {
			await ownStoreService.equip(slug);
			await load();
			onInventoryRefresh?.();
			toast.success(`${product.name} equipped`);
		} catch {
			toast.error("Could not equip item");
		} finally {
			setActing(null);
		}
	};

	const handleUnequip = async (product: OwnStoreProduct) => {
		const slug = productSlug(product);
		setActing(slug);
		try {
			await ownStoreService.unequip(slug);
			await load();
			onInventoryRefresh?.();
			toast.success(`${product.name} removed`);
		} catch {
			toast.error("Could not remove item");
		} finally {
			setActing(null);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<section className="space-y-6 animate-in fade-in duration-300">
			<div>
				<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
				<p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
			</div>
			{allProducts.length === 0 ? (
				<p className="rounded-xl border border-dashed border-border/80 py-12 text-center text-sm text-muted-foreground">
					Items coming soon. Check back after the next update.
				</p>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{allProducts.map((product) => {
						const slug = productSlug(product);
						const owned =
							ownedMap[slug] ?? (!product.isPremium && !product.comingSoon);
						const equipped = equippedMap[slug] ?? false;
						const canEquip =
							owned &&
							(product.type === "classroom_item" ||
								product.type === "audio_pack" ||
								product.type === "transport" ||
								product.type === "activity_pack");

						return (
							<OwnStoreProductCard
								key={product._id}
								product={product}
								owned={owned || !product.isPremium}
								equipped={equipped}
								purchasing={purchasing === slug}
								onBuy={() => handleBuy(product)}
								onEquip={
									canEquip && !acting
										? () => handleEquip(product)
										: undefined
								}
								onUnequip={
									canEquip && equipped && !acting
										? () => handleUnequip(product)
										: undefined
								}
							/>
						);
					})}
				</div>
			)}
		</section>
	);
}
