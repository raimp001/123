"use client"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { base } from 'wagmi/chains'
import { createClient } from '@/lib/supabase/client'
import type { User as DbUser, Lab } from '@/types/database'
import { toast } from 'sonner'
type AuthStep = 'idle' | 'connecting' | 'signing' | 'authenticating'
interface AuthContextType {
  // Wallet / auth state
  isAuthenticated: boolean
  isLoading: boolean
  walletAddress: string | null
  authStep: AuthStep
  authError: string | null
  // DB profile
  dbUser: DbUser | null
  lab: Lab | null
  isFunder: boolean
  isLab: boolean
  isAdmin: boolean
  // Actions
  connectWallet: (connectorIndex: number) => void
  disconnectWallet: () => Promise<void>
  refreshUser: () => Promise<void>
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
// Helper: run a promise with a timeout; resolves null on timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const [authStep, setAuthStep] = useState<AuthStep>('idle')
  const [authError, setAuthError] = useState<string | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [lab, setLab] = useState<Lab | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const authInProgress = useRef(false)
  const bootstrapDone = useRef(false)
  // Stable Supabase client — created once, never re-created on re-render
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (supabaseRef.current === null) {
    try {
      supabaseRef.current = createClient()
    } catch {
      supabaseRef.current = null
    }
  }
  const supabase = supabaseRef.current
  // Load DB profile after wallet auth (with 6s timeout to prevent hanging)
  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return null
    try {
      const userResult = await withTimeout(
        supabase.from('users').select('*').eq('id', userId).single(),
        6000
      )
      if (!userResult || !userResult.data) {
        setDbUser(null)
        setLab(null)
        return null
      }
      const userData = userResult.data
      setDbUser(userData)
      if (userData.role === 'lab') {
        const labResult = await withTimeout(
          supabase.from('labs').select('*').eq('user_id', userId).single(),
          5000
        )
        setLab(labResult?.data ?? null)
      } else {
        setLab(null)
      }
      return userData
    } catch {
      return null
    }
  }, [supabase])
  const finishBootstrap = useCallback((authenticated: boolean) => {
    if (bootstrapDone.current) return
    bootstrapDone.current = true
    if (!authenticated) {
      setIsAuthenticated(false)
      setDbUser(null)
      setLab(null)
    }
    setIsBootstrapping(false)
  }, [])
  // Redirect new users (or incomplete onboarding) to /onboarding
  const redirectNewUser = useCallback((profile: DbUser | null) => {
    if (typeof window === 'undefined') return
    const isOnboarding = window.location.pathname === '/onboarding'
    const isAuth = window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/signup')
    if (!isOnboarding && !isAuth && profile && !profile.onboarding_completed) {
      window.location.href = '/onboarding'
    }
  }, [])
  // On mount — check for existing Supabase session
  useEffect(() => {
    if (!supabase) {
      finishBootstrap(false)
      return
    }
    let mounted = true
    // Fallback timeout: if INITIAL_SESSION never fires within 8s, unblock UI
    const bootstrapTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthProvider] bootstrap timed out — treating as unauthenticated')
        finishBootstrap(false)
      }
    }, 8000)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user?: { id: string } } | null) => {
        clearTimeout(bootstrapTimeout)
        if (!mounted) return
        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            setIsAuthenticated(true)
            // Unblock UI immediately; load profile in background
            finishBootstrap(true)
            const profile = await loadProfile(session.user.id)
            if (mounted) redirectNewUser(profile as DbUser | null)
          } else {
            finishBootstrap(false)
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true)
          // Unblock UI immediately; load profile in background
          finishBootstrap(true)
          const profile = await loadProfile(session.user.id)
          if (mounted) redirectNewUser(profile as DbUser | null)
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setDbUser(null)
          setLab(null)
          finishBootstrap(false)
        }
      }
    )
    return () => {
      mounted = false
      clearTimeout(bootstrapTimeout)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // When wallet connects while we're in the "connecting" step, run auth
  useEffect(() => {
    if (isConnected && address && authStep === 'connecting' && !authInProgress.current) {
      authInProgress.current = true
      authenticateWallet(address).finally(() => {
        authInProgress.current = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, authStep])
  const authenticateWallet = async (walletAddress: string) => {
    try {
      setAuthStep('signing')
      setAuthError(null)
      const res = await fetch(`/api/auth/wallet?address=${walletAddress}`)
      if (!res.ok) throw new Error('Failed to get sign-in challenge')
      const { message } = await res.json()
      const signature = await signMessageAsync({ message })
      setAuthStep('authenticating')
      const authRes = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, signature, message }),
      })
      const authData = await authRes.json()
      if (!authRes.ok) {
        throw new Error(authData.error || `Server error (${authRes.status})`)
      }
      const { email, tempPassword } = authData
      if (supabase) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: tempPassword,
        })
        if (signInError) throw signInError
      }
      setAuthStep('idle')
      toast.success('Signed in')
    } catch (err) {
      disconnect()
      const msg = err instanceof Error ? err.message : 'Sign-in failed'
      if (!msg.includes('User rejected') && !msg.includes('user rejected')) {
        setAuthError(msg)
        toast.error(msg)
      }
      setAuthStep('idle')
    }
  }
  const connectWallet = useCallback((connectorIndex: number) => {
    setAuthError(null)
    setAuthStep('connecting')
    const c = connectors[connectorIndex]
    if (!c) { setAuthStep('idle'); return }
    connect({ connector: c, chainId: base.id }, {
      onError: (err) => {
        if (!err.message.includes('rejected')) setAuthError(err.message)
        setAuthStep('idle')
      },
    })
  }, [connect, connectors])
  const disconnectWallet = useCallback(async () => {
    disconnect()
    if (supabase) await supabase.auth.signOut()
    setIsAuthenticated(false)
    setDbUser(null)
    setLab(null)
    setAuthStep('idle')
    setAuthError(null)
    toast.success('Signed out')
  }, [disconnect, supabase])
  const refreshUser = useCallback(async () => {
    if (!supabase) return
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await loadProfile(session.user.id)
  }, [supabase, loadProfile])
  const stepLabel = {
    connecting: 'Opening wallet…',
    signing: 'Approve sign-in in wallet…',
    authenticating: 'Signing you in…',
    idle: null,
  }[authStep]
  const isLoading = authStep !== 'idle' || isBootstrapping
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        walletAddress: address ?? null,
        authStep,
        authError,
        dbUser,
        lab,
        isFunder: dbUser?.role === 'funder' || dbUser?.role === 'admin',
        isLab: dbUser?.role === 'lab',
        isAdmin: dbUser?.role === 'admin',
        connectWallet,
        disconnectWallet,
        refreshUser,
      }}
    >
      {/* Auth step banner */}
      {authStep !== 'idle' && (
        <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-background/90 backdrop-blur border-b py-2 text-sm text-muted-foreground">
          <span className="animate-spin">↻</span> {stepLabel}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
