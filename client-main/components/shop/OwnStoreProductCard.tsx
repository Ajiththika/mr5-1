"use client";

import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	formatOwnStorePrice,
	type OwnStoreProduct,
} from "@/services/own-store.service";

const CATEGORY_EMOJI: Record<string, string> = {
	teacher_avatar: "⭐",
	classroom_item: "🏫",
	audio_pack: "🔔",
	activity_pack: "📚",
	transport: "🚌",
};

export function OwnStoreProductCard({
	product,
	owned = false,
	equipped = false,
	purchasing = false,
	onBuy,
	onEquip,
	onUnequip,
	onPreview,
}: {
	product: OwnStoreProduct;
	owned?: boolean;
	equipped?: boolean;
	purchasing?: boolean;
	onBuy?: () => void;
	onEquip?: () => void;
	onUnequip?: () => void;
	onPreview?: () => void;
}) {
	const emoji =
		product.metadata?.assetKind === "bicycle"
			? "🚲"
			: (CATEGORY_EMOJI[product.type] ?? "✨");
	const isFree = !product.isPremium || product.priceCents <= 0;
	const comingSoon = product.comingSoon;

	return (
		<Card className="group overflow-hidden border-border/80 bg-card/90 transition-all duration-300 hover:shadow-lg">
			<CardHeader className="space-y-3 pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/15 to-indigo-500/10 text-2xl">
						{emoji}
					</div>
					{comingSoon ? (
						<Badge variant="outline" className="border-muted-foreground/30">
							Coming soon
						</Badge>
					) : product.isPremium ? (
						<Badge className="border-amber-400/30 bg-amber-500/10 text-amber-200">
							<Crown className="mr-1 h-3 w-3" />
							Premium
						</Badge>
					) : (
						<Badge variant="outline">Included</Badge>
					)}
				</div>
				<div>
					<CardTitle className="text-lg">{product.name}</CardTitle>
					{equipped && (
						<p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-400">
							<Sparkles className="h-3 w-3" />
							Equipped
						</p>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
					{product.description}
				</p>
				{product.features?.length ? (
					<ul className="space-y-1 text-xs text-muted-foreground">
						{product.features.slice(0, 4).map((feature) => (
							<li key={feature} className="flex items-start gap-1.5">
								<span className="text-amber-400/80">✓</span>
								{feature}
							</li>
						))}
					</ul>
				) : null}
				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
					<span className="text-xl font-bold text-foreground">
						{comingSoon ? "—" : formatOwnStorePrice(product.priceCents)}
					</span>
					<div className="flex flex-wrap gap-2">
						{onPreview && !comingSoon && (
							<Button size="sm" variant="outline" onClick={onPreview}>
								Preview
							</Button>
						)}
						{comingSoon ? (
							<Button size="sm" variant="secondary" disabled>
								Notify me
							</Button>
						) : owned || isFree ? (
							<>
								<Button size="sm" variant="secondary" disabled className="gap-1">
									<Check className="h-4 w-4" />
									Owned
								</Button>
								{onEquip && !equipped && (
									<Button size="sm" onClick={onEquip}>
										Equip
									</Button>
								)}
								{onUnequip && equipped && (
									<Button size="sm" variant="outline" onClick={onUnequip}>
										Remove
									</Button>
								)}
							</>
						) : (
							<Button size="sm" disabled={purchasing} onClick={onBuy}>
								{purchasing ? (
									<>
										<Loader2 className="mr-1 h-4 w-4 animate-spin" />
										Processing…
									</>
								) : (
									"Buy Now"
								)}
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
