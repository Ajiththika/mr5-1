"use client";

import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_oklch(var(--shadow-color)/0.06),0_4px_12px_oklch(var(--shadow-color)/0.04)] ${className}`}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export const CardHeader = ({ className = "", ...props }: CardProps) => (
  <div className={`p-4 border-b ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }: CardProps) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props} />
);

export const CardDescription = ({ className = "", ...props }: CardProps) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: CardProps) => (
  <div className={`p-4 ${className}`} {...props} />
);

export const CardFooter = ({ className = "", ...props }: CardProps) => (
  <div className={`p-4 border-t ${className}`} {...props} />
);

export default Card;
