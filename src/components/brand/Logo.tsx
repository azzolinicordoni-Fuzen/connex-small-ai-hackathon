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

// Circular "O" with concentric arcs and dots - matching brand reference
function CircularO({ size = 24, className }: { size?: number; className?: string }) {
  const center = size / 2;
  const strokeWidth = size * 0.06;
  
  // Ring configurations: [radius, segments array with [startAngle, endAngle, hasDot]]
  const rings = [
    { 
      radius: size * 0.42, 
      segments: [
        { start: -30, end: 80, dot: true },
        { start: 100, end: 180, dot: false },
        { start: 200, end: 320, dot: true },
      ]
    },
    { 
      radius: size * 0.32, 
      segments: [
        { start: 20, end: 120, dot: true },
        { start: 150, end: 230, dot: false },
        { start: 260, end: 350, dot: true },
      ]
    },
    { 
      radius: size * 0.22, 
      segments: [
        { start: -60, end: 60, dot: false },
        { start: 120, end: 240, dot: true },
        { start: 280, end: 340, dot: false },
      ]
    },
  ];

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* Arcs */}
      {rings.map((ring, ringIndex) => (
        ring.segments.map((segment, segIndex) => {
          const arcPath = describeArc(center, center, ring.radius, segment.start, segment.end);
          const midAngle = (segment.start + segment.end) / 2;
          const dotPos = polarToCartesian(center, center, ring.radius, segment.dot ? segment.end + 8 : midAngle);
          
          return (
            <g key={`${ringIndex}-${segIndex}`}>
              <path
                d={arcPath}
                fill="none"
                stroke="#9eff1f"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {segment.dot && (
                <circle
                  cx={dotPos.x}
                  cy={dotPos.y}
                  r={size * 0.025}
                  fill="#9eff1f"
                />
              )}
            </g>
          );
        })
      ))}
      
      {/* Center circle */}
      <circle
        cx={center}
        cy={center}
        r={size * 0.1}
        fill="none"
        stroke="#9eff1f"
        strokeWidth={strokeWidth * 0.8}
      />
      
      {/* Extra floating dots */}
      <circle cx={center + size * 0.35} cy={center - size * 0.25} r={size * 0.02} fill="#9eff1f" opacity={0.8} />
      <circle cx={center - size * 0.38} cy={center + size * 0.18} r={size * 0.018} fill="#9eff1f" opacity={0.6} />
      <circle cx={center + size * 0.15} cy={center + size * 0.4} r={size * 0.015} fill="#9eff1f" opacity={0.7} />
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
