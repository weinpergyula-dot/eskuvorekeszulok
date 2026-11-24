import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#E8336A] text-white",
        secondary: "bg-gray-100 text-gray-900",
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        admin: "bg-[#B8925A] text-white",
        rejected: "bg-[#F06C6C]/10 text-[#F06C6C]",
        outline: "border border-[#E8336A] text-[#E8336A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
