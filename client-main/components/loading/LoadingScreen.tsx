"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MR5_LOGO_PATH } from "@/lib/brand/logo";

export default function LoadingScreen({
	onComplete,
}: {
	onComplete?: () => void;
}) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					if (onComplete) setTimeout(onComplete, 400);
					return 100;
				}
				return prev + 4;
			});
		}, 90);

		return () => clearInterval(interval);
	}, [onComplete]);

	return (
		<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background">
			{/* Ambient background */}
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,hsl(var(--primary)/0.12),transparent_65%)]"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.08),transparent_50%)]"
				aria-hidden
			/>
			<div className="noise-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.55, ease: "easeOut" }}
				className="relative z-10 flex w-full max-w-lg flex-col items-center px-6 text-center"
			>
				{/* Logo — wide crest; use full aspect ratio so it reads large */}
				<div className="relative mb-8 w-[min(88vw,20rem)] sm:w-[min(85vw,24rem)] md:w-[28rem]">
					<div
						className="absolute -inset-6 rounded-full bg-primary/20 blur-3xl sm:-inset-10"
						aria-hidden
					/>
					<motion.div
						animate={{ scale: [1, 1.02, 1] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						className="relative aspect-[612/408] w-full"
					>
						<Image
							src={MR5_LOGO_PATH}
							alt="MR5 School"
							fill
							priority
							sizes="(max-width: 640px) 88vw, (max-width: 768px) 384px, 448px"
							className="object-contain drop-shadow-[0_0_40px_hsl(var(--primary)/0.45)]"
						/>
					</motion.div>
				</div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.15 }}
					className="mb-10 text-lg font-medium italic tracking-wide text-muted-foreground sm:text-xl"
				>
					The Smart Way to Grow
				</motion.p>

				{/* Progress */}
				<div className="w-full max-w-xs sm:max-w-sm">
					<div className="h-1.5 overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/50">
						<motion.div
							className="h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-violet-500 shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
							style={{ width: `${progress}%` }}
							transition={{ duration: 0.2 }}
						/>
					</div>
					<p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
						Initializing system
						<span className="mx-2 text-border">·</span>
						<span className="tabular-nums text-foreground/80">{progress}%</span>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
