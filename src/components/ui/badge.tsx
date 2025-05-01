
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-idxf-lime text-idxf-black hover:bg-opacity-90 shadow-md",
        secondary:
          "bg-idxf-olive text-idxf-black hover:bg-opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-idxf-lime text-white",
        monochrome: "bg-idxf-gray text-white hover:bg-opacity-90 shadow-sm",
        skill: "bg-idxf-black/30 text-white py-1 px-3 text-xs"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  monochrome?: boolean;
}

function Badge({ className, variant, monochrome = false, ...props }: BadgeProps) {
  // If monochrome is true, use the monochrome variant regardless of the provided variant
  const effectiveVariant = monochrome ? "monochrome" : variant;
  
  return (
    <div className={cn(badgeVariants({ variant: effectiveVariant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
