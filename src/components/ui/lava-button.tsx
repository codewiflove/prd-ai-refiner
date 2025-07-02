import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const lavaButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default: [
          "lava-button-enhanced text-white font-semibold",
          "shadow-lava hover:shadow-lava-intense",
          "transform hover:scale-105 active:scale-95",
          "animate-lava-glow hover:animate-lava-bubble",
        ],
        intense: [
          "lava-button-enhanced text-white font-bold",
          "shadow-lava-intense hover:shadow-lava-pulse",
          "transform hover:scale-110 active:scale-95",
          "animate-lava-glow hover:animate-lava-bubble",
          "brightness-110 saturate-110",
        ],
        subtle: [
          "bg-gradient-lava text-white",
          "shadow-lava/50 hover:shadow-lava",
          "transform hover:scale-102 active:scale-98",
          "hover:animate-lava-bubble",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-12 text-lg font-bold",
        icon: "h-10 w-10",
      },
      glow: {
        none: "",
        soft: "drop-shadow-[0_0_10px_rgba(255,165,0,0.3)]",
        medium: "drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]",
        intense: "drop-shadow-[0_0_30px_rgba(255,165,0,0.7)]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "medium",
    },
  }
)

export interface LavaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof lavaButtonVariants> {
  asChild?: boolean
  particles?: boolean
}

const LavaButton = React.forwardRef<HTMLButtonElement, LavaButtonProps>(
  ({ className, variant, size, glow, asChild = false, particles = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(lavaButtonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      >
        {/* Content wrapper to ensure proper z-index */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        
        {/* Particle effect overlay */}
        {particles && (
          <div className="lava-particles">
            <div className="lava-particle"></div>
            <div className="lava-particle"></div>
            <div className="lava-particle"></div>
            <div className="lava-particle"></div>
            <div className="lava-particle"></div>
            <div className="lava-particle"></div>
          </div>
        )}
        
        {/* Inner glow effect */}
        <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/25 via-transparent to-orange-400/10 opacity-60 pointer-events-none" />
      </Comp>
    )
  }
)
LavaButton.displayName = "LavaButton"

export { LavaButton, lavaButtonVariants }