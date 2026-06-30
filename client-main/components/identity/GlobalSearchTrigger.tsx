"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalAcademicSearch } from "@/components/identity/GlobalAcademicSearch";

type GlobalSearchTriggerProps = {
	className?: string;
	"data-tour-id"?: string;
};

/** Always-available academic search — compact in navbar, full-screen sheet on mobile. */
export function GlobalSearchTrigger({ className, "data-tour-id": tourId }: GlobalSearchTriggerProps) {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<>
			{/* Desktop / tablet inline search */}
			<div className={className} data-tour-id={tourId}>
				<div className="hidden min-w-0 flex-1 md:block lg:max-w-md xl:max-w-lg">
					<GlobalAcademicSearch variant="compact" showShortcut />
				</div>

				{/* Mobile search icon → full-screen overlay */}
				<div className="md:hidden">
					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="touch-target shrink-0"
								aria-label="Open academic search"
							>
								<Search className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent
							side="top"
							className="h-auto border-b border-border bg-background/98 pb-[max(1rem,var(--safe-bottom))] pt-[max(1rem,var(--safe-top))]"
						>
							<SheetHeader className="sr-only">
								<SheetTitle>Academic search</SheetTitle>
							</SheetHeader>
							<GlobalAcademicSearch
								variant="inline"
								showShortcut={false}
								autoFocus
								onNavigate={() => setMobileOpen(false)}
							/>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</>
	);
}
