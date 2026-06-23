"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Application Error:", error);
	}, [error]);

	const isChunkError =
		error.message?.includes("Loading chunk") ||
		error.message?.includes("ChunkLoadError") ||
		error.name === "ChunkLoadError";

	useEffect(() => {
		if (!isChunkError || typeof window === "undefined") return;
		const key = "mr5_chunk_recover";
		if (!sessionStorage.getItem(key)) {
			sessionStorage.setItem(key, "1");
			window.location.reload();
		}
	}, [isChunkError]);

	const handleHardReload = () => {
		if (typeof window === "undefined") return;
		sessionStorage.removeItem("mr5_chunk_recover");
		const goHome = () => {
			window.location.assign("/");
		};
		if ("caches" in window) {
			void caches
				.keys()
				.then((names) => Promise.all(names.map((n) => caches.delete(n))))
				.finally(goHome);
			return;
		}
		goHome();
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="max-w-md w-full text-center space-y-8">
				<div className="flex justify-center">
					<div className="bg-destructive/15 rounded-full p-6 border border-destructive/30">
						<AlertTriangle className="h-16 w-16 text-destructive" />
					</div>
				</div>

				<div className="space-y-4">
					<h1 className="text-4xl font-bold text-foreground">
						Something Went Wrong
					</h1>
					<p className="text-muted-foreground text-lg">
						We encountered an unexpected error.
					</p>
					{process.env.NODE_ENV === "development" && (
						<div className="bg-muted rounded-lg p-4 text-left border border-border">
							<p className="text-destructive text-sm font-mono break-all">
								{error.message}
							</p>
						</div>
					)}
					{isChunkError && (
						<p className="text-sm text-muted-foreground">
							A stale page cache was detected. Use the button below if the page does not recover automatically.
						</p>
					)}
				</div>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					{isChunkError ? (
						<Button onClick={handleHardReload} size="lg">
							<RefreshCw className="mr-2 h-5 w-5" />
							Clear Cache &amp; Reload
						</Button>
					) : (
						<Button onClick={reset} size="lg">
							<RefreshCw className="mr-2 h-5 w-5" />
							Try Again
						</Button>
					)}
					<Button asChild variant="outline" size="lg">
						<Link href="/">
							<Home className="mr-2 h-5 w-5" />
							Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
