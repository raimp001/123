"use client"

import { cn } from "@/lib/utils"

interface SciFlowLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "light" | "dark"
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8", 
  lg: "w-10 h-10",
  xl: "w-12 h-12"
}

const textSizeClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl"
}

export function SciFlowLogo({ 
  size = "md", 
  variant = "default",
  showText = true,
  className 
}: SciFlowLogoProps) {
  const isDark = variant === "dark"
  const isLight = variant === "light"
  
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Logo Mark */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl",
        sizeClasses[size],
        isDark ? "bg-slate-900" : isLight ? "bg-white" : "bg-gradient-to-br from-slate-800 to-slate-900"
      )}>
        {/* Outer glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-emerald-400/20 blur-sm" />
        
        {/* Main logo container */}
        <div className={cn(
          "relative flex items-center justify-center rounded-xl",
          sizeClasses[size],
          "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800",
          "border border-slate-700/50"
        )}>
          <svg 
            viewBox="0 0 32 32" 
            fill="none" 
            className={cn(
              size === "sm" ? "w-4 h-4" : 
              size === "md" ? "w-5 h-5" : 
              size === "lg" ? "w-6 h-6" : "w-7 h-7"
            )}
          >
            {/* Flask/beaker shape - sleek minimal design */}
            <defs>
              <linearGradient id="flaskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D4A574" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            
            {/* Flask outline */}
            <path 
              d="M12 4V12L6 24C5.5 25 6 26 7 26H25C26 26 26.5 25 26 24L20 12V4" 
              stroke="url(#flaskGradient)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            
            {/* Flask neck */}
            <path 
              d="M12 4H20" 
              stroke="url(#flaskGradient)" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
            
            {/* Liquid inside */}
            <path 
              d="M8 20L12 14V12H20V14L24 20C24.5 21 24 22 23 22H9C8 22 7.5 21 8 20Z" 
              fill="url(#liquidGradient)"
              opacity="0.7"
            />
            
            {/* Bubbles - representing flow/activity */}
            <circle cx="14" cy="18" r="1.5" fill="#34D399" opacity="0.9" />
            <circle cx="18" cy="20" r="1" fill="#6EE7B7" opacity="0.8" />
            <circle cx="16" cy="16" r="0.8" fill="#A7F3D0" opacity="0.7" />
          </svg>
        </div>
      </div>
      
      {/* Text */}
      {showText && (
        <span className={cn(
          "font-bold tracking-tight",
          textSizeClasses[size],
          isDark ? "text-slate-900" : isLight ? "text-white" : "text-slate-100"
        )}>
          Sci<span className="text-amber-400">Flow</span>
        </span>
      )}
    </div>
  )
}

// Simple icon-only version for favicon/small spaces
export function SciFlowIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      className={cn("w-8 h-8", className)}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      
      {/* Rounded square background */}
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#1E293B" />
      
      {/* Flask */}
      <path 
        d="M12 6V12L7 22C6.5 23 7 24 8 24H24C25 24 25.5 23 25 22L20 12V6" 
        stroke="url(#iconGradient)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M12 6H20" stroke="url(#iconGradient)" strokeWidth="2" strokeLinecap="round" />
      
      {/* Liquid */}
      <path 
        d="M9 18L12 13H20L23 18C23.5 19 23 20 22 20H10C9 20 8.5 19 9 18Z" 
        fill="#10B981"
        opacity="0.6"
      />
      
      {/* Bubbles */}
      <circle cx="14" cy="17" r="1.2" fill="#34D399" />
      <circle cx="18" cy="18.5" r="0.8" fill="#6EE7B7" />
    </svg>
  )
}
