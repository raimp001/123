"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Copy, ExternalLink, ChevronDown, Check, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'

function fmt(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function ConnectWalletButton({ variant = 'header' }: { variant?: 'header' | 'sidebar' }) {
  const { isAuthenticated, isLoading, login, logout, walletAddress, privyUser } = useAuth()
  const [copied, setCopied] = useState(false)

  const displayName = privyUser?.email?.address
    ?? privyUser?.google?.name
    ?? (walletAddress ? fmt(walletAddress) : null)
    ?? 'Account'

  const copy = () => {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    toast.success('Copied')
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading ──
  if (isLoading) {
    if (variant === 'sidebar') {
      return (
        <div className="mt-1 px-2.5 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading…
        </div>
      )
    }
    return (
      <Button variant="outline" size="sm" className="rounded-full gap-2 opacity-60" disabled>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </Button>
    )
  }

  // ── Authenticated ──
  if (isAuthenticated) {
    if (variant === 'sidebar') {
      return (
        <div className="mt-1 border border-border/40 rounded-lg px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs text-foreground/80 truncate">{displayName}</span>
            </div>
            <button onClick={logout} className="text-xs text-muted-foreground hover:text-red-400 transition-colors shrink-0">
              Out
            </button>
          </div>
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full gap-2 px-3 border-emerald-500/30 bg-emerald-500/5 max-w-44">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs truncate">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">Signed in</p>
            <p className="text-sm font-medium mt-0.5 truncate">{displayName}</p>
            {walletAddress && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{fmt(walletAddress)}</p>
            )}
          </div>
          <DropdownMenuSeparator />
          {walletAddress && (
            <>
              <DropdownMenuItem onClick={copy} className="cursor-pointer">
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy address'}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <a href={`https://basescan.org/address/${walletAddress}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> BaseScan
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 focus:text-red-400">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // ── Not authenticated ──
  if (variant === 'sidebar') {
    return (
      <button
        onClick={login}
        className="mt-1 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
      >
        <Wallet className="w-3.5 h-3.5" />
        Sign in
      </button>
    )
  }

  return (
    <Button size="sm" className="rounded-full gap-2" onClick={login}>
      <Wallet className="w-3.5 h-3.5" />
      Sign In
    </Button>
  )
}
