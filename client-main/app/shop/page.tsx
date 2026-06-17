"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shopService, ShopItem } from "@/services/shop.service";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";

const TYPE_EMOJI: Record<string, string> = {
	hat: "🎩",
	shirt: "👕",
	accessory: "🕶️",
	book: "📖",
};

export default function ShopPage() {
	const { user } = useEnhancedUser();
	const [items, setItems] = useState<ShopItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [purchasing, setPurchasing] = useState<string | null>(null);

	useEffect(() => {
		shopService
			.getItems()
			.then((res) => setItems(res.data || []))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const handlePurchase = async (itemId: string) => {
		if (!user) {
			toast.error("Please log in to purchase items");
			return;
		}
		setPurchasing(itemId);
		try {
			await shopService.purchase(itemId);
			toast.success("Item purchased! View it in your profile.");
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Purchase failed";
			toast.error(message);
		} finally {
			setPurchasing(null);
		}
	};

	const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="container mx-auto px-4 py-12">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<ShoppingBag className="w-8 h-8 text-primary" />
							Avatar Shop
						</h1>
						<p className="text-muted-foreground mt-1">
							Cosmetic items for your campus avatar
						</p>
					</div>
					{user && (
						<Button variant="outline" asChild>
							<Link href="/profile">My inventory</Link>
						</Button>
					)}
				</div>

				{loading ? (
					<div className="flex justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : items.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center text-muted-foreground">
							Shop items coming soon. Check back after the next update.
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{items.map((item) => (
							<Card key={item._id} className="overflow-hidden">
								<CardHeader className="pb-2">
									<div className="text-4xl mb-2">{TYPE_EMOJI[item.type] || "✨"}</div>
									<CardTitle className="text-lg">{item.name}</CardTitle>
									<Badge variant="outline" className="w-fit capitalize">
										{item.type}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-sm text-muted-foreground line-clamp-2">
										{item.description}
									</p>
									<div className="flex items-center justify-between">
										<span className="text-xl font-bold">{formatPrice(item.priceCents)}</span>
										<Button
											size="sm"
											disabled={purchasing === item._id}
											onClick={() => handlePurchase(item._id)}
										>
											{purchasing === item._id ? "Buying..." : "Buy"}
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
