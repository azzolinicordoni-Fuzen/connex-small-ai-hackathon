import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

const iconSizes = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 36,
};

// Circular "O" icon with dots pattern inspired by the brand
function CircularO({ size = 24, className }: { size?: number; className?: string }) {
  const dotCount = 24;
  const radius = size * 0.38;
  const dotRadius = size * 0.04;
  const center = size / 2;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {Array.from({ length: dotCount }).map((_, i) => {
        const angle = (i / dotCount) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        // Vary dot size slightly for organic feel
        const r = dotRadius * (0.8 + Math.random() * 0.4);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="#9eff1f"
          />
        );
      })}
    </svg>
  );
}

export function Logo({ 
  variant = "default", 
  size = "md", 
  showText = true,
  className 
}: LogoProps) {
  const textColor = variant === "light" 
    ? "text-white" 
    : "text-foreground";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {showText && (
        <span className={cn(
          "font-display font-bold tracking-tight",
          sizeClasses[size],
          textColor
        )}>
          C
        </span>
      )}
      <CircularO size={iconSizes[size]} />
      {showText && (
        <span className={cn(
          "font-display font-bold tracking-tight",
          sizeClasses[size],
          textColor
        )}>
          NNEX
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <CircularO size={iconSizes[size] * 1.5} />
    </div>
  );
}