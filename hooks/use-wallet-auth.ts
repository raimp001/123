"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { base } from 'wagmi/chains'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

type Step = 'idle' | 'connecting' | 'signing' | 'authenticating'

export function useWalletAuth() {
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const authLock = useRef(false)

  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { signInWithWallet, signOut, isAuthenticated } = useAuth()

  // Once wallet connects, immediately run auth
  useEffect(() => {
    if (isConnected && address && step === 'connecting' && !authLock.current) {
      authLock.current = true
      authenticate(address).finally(() => { authLock.current = false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, step])

  const authenticate = async (walletAddress: string) => {
    try {
      setStep('signing')
      setError(null)

      // Get challenge from server
      const res = await fetch(`/api/auth/wallet?address=${walletAddress}`)
      if (!res.ok) throw new Error('Failed to get sign-in challenge')
      const { message } = await res.json()

      // Sign with Coinbase Smart Wallet (EIP-1271)
      const signature = await signMessageAsync({ message })

      setStep('authenticating')

      // Verify + create session
      const { error: authError } = await signInWithWallet('evm', walletAddress, signature, message, '')
      if (authError) throw authError

      setStep('idle')
      toast.success('Signed in')
    } catch (err) {
      disconnect()
      const msg = err instanceof Error ? err.message : 'Sign-in failed'
      setError(msg)
      setStep('idle')
    }
  }

  const signIn = useCallback(() => {
    setError(null)
    setStep('connecting')
    const connector = connectors[0] // Coinbase Smart Wallet
    if (!connector) {
      setError('Coinbase Wallet not available')
      setStep('idle')
      return
    }
    connect(
      { connector, chainId: base.id },
      { onError: (e) => { setError(e.message); setStep('idle') } }
    )
  }, [connect, connectors])

  const signOut_ = useCallback(async () => {
    disconnect()
    await signOut()
    setStep('idle')
    setError(null)
  }, [disconnect, signOut])

  const stepLabel = {
    connecting: 'Opening Coinbase Wallet...',
    signing: 'Approve sign-in in your wallet...',
    authenticating: 'Signing you in...',
    idle: null,
  }[step]

  return {
    address,
    isConnected,
    isAuthenticated,
    isLoading: step !== 'idle' || isPending,
    step,
    stepLabel,
    error,
    activeConnector: connector,
    signIn,
    signOut: signOut_,
  }
}
