import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
 * Note: variants never set margin/width/display overrides, so callers can add layout classes
 * (w-full, mt-*, col-span-*) without needing tailwind-merge. For a different look, add a variant
 * instead of overriding colours via className.
 */
export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-bold transition-[transform,background-color,box-shadow,opacity] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110",
        gradient: "bg-brand-gradient text-white shadow-lg shadow-primary/30 hover:brightness-110",
        secondary: "bg-card text-foreground border-2 border-border hover:border-primary/60",
        light: "bg-white text-[#1C1838] hover:brightness-95",
        outline: "border-2 border-primary text-primary hover:bg-primary/10",
        ghost: "text-foreground hover:bg-muted",
        dangerGhost: "text-danger hover:bg-danger/10",
        whatsapp: "bg-[#25D366] text-[#073B1C] shadow-lg shadow-[#25D366]/25 hover:brightness-105",
        danger: "bg-danger text-white hover:brightness-110",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        default: "h-12 px-5 text-base",
        lg: "h-14 px-6 text-lg",
        xl: "h-16 px-7 text-lg",
        hero: "h-16 px-7 text-xl",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
