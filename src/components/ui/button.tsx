import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#84AAA6] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "tile-cta",
        outline:
          "bg-[#F0F6F5] text-[#5C8480] hover:bg-[#E3EFED]",
        ghost:
          "text-[#84AAA6] hover:bg-[#84AAA6]/10",
        destructive:
          "bg-[#F06C6C] text-white shadow-[0_10px_24px_-10px_rgba(240,108,108,0.7)] hover:bg-[#E25B5B]",
        secondary:
          "bg-white text-gray-900 ring-1 ring-black/5 hover:bg-[#F0F6F5]",
        link:
          "text-[#84AAA6] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-base",
        lg: "h-11 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
