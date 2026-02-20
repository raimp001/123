"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">SciFlow</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Fund breakthrough research. Pay only on proof.
          </p>
        </div>

        <Button
          className="w-full h-12 text-sm gap-2.5 rounded-xl"
          onClick={login}
        >
          Sign In
        </Button>

        <p className="text-xs text-muted-foreground">
          Email · Google · Wallet — all supported.
          <br />
          Powered by Privy on Base.
        </p>
      </div>
    </div>
  )
}
