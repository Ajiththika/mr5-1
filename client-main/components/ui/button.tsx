import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { getBrandSoundManager } from "@/lib/audio";
import type { SoundCategory } from "@/lib/audio";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground font-semibold shadow-[0_1px_2px_oklch(var(--primary)/0.25),0_4px_12px_oklch(var(--primary)/0.15)] hover:bg-primary/92 hover:shadow-[0_2px_6px_oklch(var(--primary)/0.3),0_8px_20px_oklch(var(--primary)/0.18)] active:scale-[0.98]",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border border-border bg-card text-foreground shadow-sm hover:bg-muted hover:border-primary/20 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground font-medium border border-border/80 shadow-sm hover:bg-secondary/85",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const Button = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> &
		VariantProps<typeof buttonVariants> & {
			asChild?: boolean;
			sound?: SoundCategory | false;
		}
>(({ className, variant, size, asChild = false, sound, onClick, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (sound) {
			getBrandSoundManager().play(sound);
		}
		onClick?.(event);
	};

	return (
		<Comp
			ref={ref}
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			onClick={handleClick}
			{...props}
		/>
	);
});

Button.displayName = "Button";

export { Button, buttonVariants };
