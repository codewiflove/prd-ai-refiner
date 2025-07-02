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
          "bg-gradient-lava text-white font-semibold",
          "shadow-lava hover:shadow-lava-intense",
          "transform hover:scale-105 active:scale-95",
          "animate-lava-glow",
          // Animated background overlay
          "before:absolute before:inset-0 before:bg-gradient-lava-animate before:opacity-0 hover:before:opacity-40 before:transition-opacity before:duration-700",
          // Shimmer effect
          "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-1000 after:ease-out",
          // Bubble effect
          "hover:animate-lava-bubble",
        ],
        intense: [
          "bg-gradient-lava-intense text-white font-bold",
          "shadow-lava-intense hover:shadow-lava-pulse",
          "transform hover:scale-110 active:scale-95",
          "animate-lava-glow",
          // More intense effects
          "before:absolute before:inset-0 before:bg-gradient-lava-animate before:opacity-20 hover:before:opacity-60 before:transition-opacity before:duration-500",
          "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-800",
          "hover:animate-lava-bubble",
          // Additional glow layers
          "before:shadow-lava-pulse",
        ],
        subtle: [
          "bg-gradient-lava text-white",
          "shadow-lava/50 hover:shadow-lava",
          "transform hover:scale-102 active:scale-98",
          "before:absolute before:inset-0 before:bg-gradient-lava-animate before:opacity-0 hover:before:opacity-20 before:transition-opacity before:duration-500",
        ]
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
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-1 h-1 bg-lava-bright rounded-full opacity-60",
                  "animate-pulse",
                )}
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Inner glow effect */}
        <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" />
      </Comp>
    )
  }
)
LavaButton.displayName = "LavaButton"

export { LavaButton, lavaButtonVariants }