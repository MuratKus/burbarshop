'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent-coral text-white hover:bg-accent-coral/90 shadow-elegant hover:shadow-elegant-hover",
        secondary: "bg-transparent text-primary-charcoal border border-neutral-border-light hover:bg-neutral-border-light hover:shadow-elegant",
        outline: "border border-accent-coral text-accent-coral bg-transparent hover:bg-accent-coral hover:text-white",
        ghost: "hover:bg-neutral-border-light hover:text-primary-charcoal",
        link: "text-accent-navy underline-offset-4 hover:underline",
        admin: "bg-admin-sidebar text-white hover:bg-admin-sidebar/90 shadow-admin-card",
        sage: "bg-primary-sage text-white hover:bg-primary-sage/90 shadow-elegant",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }