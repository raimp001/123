"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createClient } from '@/lib/supabase/client'
import type { User as DbUser, Lab } from '@/types/database'

interface AuthContextType {
  // Privy user state
  privyUser: ReturnType<typeof usePrivy>['user']
  isAuthenticated: boolean
  isLoading: boolean

  // DB user profile
  dbUser: DbUser | null
  lab: Lab | null
  isFunder: boolean
  isLab: boolean
  isAdmin: boolean

  // Wallet
  walletAddress: string | null
  embeddedWallet: { address: string } | null

  // Actions
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>

  // Legacy compat — kept for existing API routes
  signInWithWallet: (
    provider: 'solana' | 'evm',
    address: string,
    signature: string,
    message: string,
    nonce: string,
  ) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, authenticated, ready, login, logout: privyLogout } = usePrivy()
  const { wallets } = useWallets()

  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [lab, setLab] = useState<Lab | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const supabase = createClient()

  // Find the embedded or connected wallet
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') ?? wallets[0] ?? null
  const walletAddress = embeddedWallet?.address ?? null

  // Sync Privy user → Supabase user record
  const syncUser = useCallback(async () => {
    if (!privyUser || !supabase) return
    setIsSyncing(true)

    try {
      const res = await fetch('/api/auth/privy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          email: privyUser.email?.address,
          walletAddress: walletAddress?.toLowerCase(),
          name: privyUser.google?.name,
        }),
      })

      if (!res.ok) return

      const { userId } = await res.json()

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userData) {
        setDbUser(userData)
        if (userData.role === 'lab') {
          const { data: labData } = await supabase
            .from('labs')
            .select('*')
            .eq('user_id', userId)
            .single()
          setLab(labData)
        }
      }
    } catch (e) {
      console.error('[Auth] Sync failed:', e)
    } finally {
      setIsSyncing(false)
    }
  }, [privyUser, walletAddress, supabase])

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      syncUser()
    } else if (ready && !authenticated) {
      setDbUser(null)
      setLab(null)
    }
  }, [ready, authenticated, privyUser, syncUser])

  const logout = useCallback(async () => {
    await privyLogout()
    setDbUser(null)
    setLab(null)
  }, [privyLogout])

  // Legacy wallet sign-in compat (used by old hooks — now a no-op via Privy)
  const signInWithWallet = async () => ({ error: null })

  const value: AuthContextType = {
    privyUser,
    isAuthenticated: authenticated,
    isLoading: !ready || isSyncing,
    dbUser,
    lab,
    isFunder: dbUser?.role === 'funder' || dbUser?.role === 'admin',
    isLab: dbUser?.role === 'lab',
    isAdmin: dbUser?.role === 'admin',
    walletAddress,
    embeddedWallet: embeddedWallet ? { address: embeddedWallet.address } : null,
    login,
    logout,
    refreshUser: syncUser,
    signInWithWallet,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
