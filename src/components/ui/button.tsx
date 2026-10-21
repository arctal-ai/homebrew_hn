// ABOUTME: Button component with style variants and sizes.
// ABOUTME: Can render as its child element via the asChild prop.
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    defaultVariants: {
      rounded: "default",
      size: "default",
      variant: "default"
    },
    variants: {
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none"
      },
      size: {
        default: "h-9 px-4 py-2",
        icon: "h-8 w-8",
        iconSm: "h-6 w-6",
        lg: "h-10 px-8",
        link: "p-0 shrink",
        sm: "h-8 px-3 text-xs",
        xs: "gap-1 px-2 py-1 text-xs [&_svg]:w-3 [&_svg]:h-3"
      },
      variant: {
        admin: "bg-admin text-admin-foreground shadow-sm hover:bg-admin/90",
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:text-primary/80 underline",
        linkDestructive:
          "text-red-500 underline-offset-4 hover:text-red-500/80 underline",
        llm: "bg-royalblue-600 dark:bg-royalblue-400 text-white shadow-sm hover:bg-royalblue-700 dark:hover:bg-royalblue-300",
        outline:
          "border border-input bg-background dark:bg-background shadow-xs hover:bg-secondary/80 dark:hover:bg-secondary/80 hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80"
      }
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, rounded, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ className, rounded, size, variant }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
