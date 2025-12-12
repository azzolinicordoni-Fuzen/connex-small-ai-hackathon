import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

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
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export function Logo({ 
  variant = "default", 
  size = "md", 
  showText = true,
  className 
}: LogoProps) {
  const textColor = variant === "light" 
    ? "text-white" 
    : variant === "dark" 
      ? "text-foreground" 
      : "text-foreground";
  
  const iconBgColor = "bg-primary";
  const iconColor = "text-primary-foreground";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showText && (
        <span className={cn(
          "font-display font-bold tracking-tight",
          sizeClasses[size],
          textColor
        )}>
          C
        </span>
      )}
      <div className={cn(
        "rounded-full flex items-center justify-center",
        size === "sm" && "w-5 h-5",
        size === "md" && "w-6 h-6",
        size === "lg" && "w-7 h-7",
        size === "xl" && "w-9 h-9",
        iconBgColor
      )}>
        <Leaf className={cn(iconSizes[size], iconColor)} />
      </div>
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
    <div className={cn(
      "rounded-full bg-primary flex items-center justify-center",
      size === "sm" && "w-6 h-6",
      size === "md" && "w-8 h-8",
      size === "lg" && "w-10 h-10",
      size === "xl" && "w-12 h-12",
      className
    )}>
      <Leaf className={cn(
        "text-primary-foreground",
        size === "sm" && "w-3 h-3",
        size === "md" && "w-4 h-4",
        size === "lg" && "w-5 h-5",
        size === "xl" && "w-6 h-6",
      )} />
    </div>
  );
}