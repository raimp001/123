"use client"

import { cn } from "@/lib/utils"

interface SciFlowLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function SciFlowLogo({ 
  size = "md", 
  showText = true,
  className 
}: SciFlowLogoProps) {
  const iconSize = size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-8 h-8"
  const textSize = size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-xl"
  
  // Warm terracotta/orange accent color like Claude
  const accentColor = "hsl(20, 70%, 55%)"
  const accentColorLight = "hsl(20, 70%, 65%)"
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className={iconSize}
      >
        <path 
          d="M9 3V11L5 19C4.5 20 5 21 6 21H18C19 21 19.5 20 19 19L15 11V3" 
          stroke={accentColor}
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M9 3H15" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="15" r="1.2" fill={accentColor} />
        <circle cx="14" cy="16" r="0.9" fill={accentColorLight} />
      </svg>
      {showText && (
        <span className={cn("font-medium text-foreground", textSize)}>
          SciFlow
        </span>
      )}
    </div>
  )
}
