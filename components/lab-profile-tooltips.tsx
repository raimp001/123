"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TIER_HELP =
  "Basic: email verified. Verified: full KYC. Trusted: successful track record. Institutional: university/company verified."

const STAKING_HELP =
  "Labs stake USDC to submit proposals. Stake is slashable if the lab breaches the bounty agreement. Higher stake signals commitment."

export function LabTierBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className ?? ""}`}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {TIER_HELP}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function LabStakingHelp({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {STAKING_HELP}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
