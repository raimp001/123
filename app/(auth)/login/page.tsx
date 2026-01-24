"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FlaskConical, Mail, Wallet, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail, signInWithWallet } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletConnecting, setWalletConnecting] = useState<'solana' | 'evm' | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await signInWithEmail(email, password)
    
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleWalletConnect = async (provider: 'solana' | 'evm') => {
    setWalletConnecting(provider)
    setError(null)

    try {
      let address: string
      let signature: string

      if (provider === 'solana') {
        // Check if Phantom is installed
        const solana = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; signMessage: (msg: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }> } }).solana
        if (!solana?.isPhantom) {
          throw new Error('Please install Phantom wallet')
        }

        // Connect wallet
        const resp = await solana.connect()
        address = resp.publicKey.toString()

        // Sign message
        const message = `Sign this message to authenticate with SciFlow.\n\nTimestamp: ${Date.now()}`
        const encodedMessage = new TextEncoder().encode(message)
        const signedMessage = await solana.signMessage(encodedMessage, 'utf8')
        signature = Buffer.from(signedMessage.signature).toString('base64')
      } else {
        // Check if MetaMask is installed
        const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<string[]> } }).ethereum
        if (!ethereum) {
          throw new Error('Please install MetaMask')
        }

        // Connect wallet
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        address = accounts[0]

        // Sign message
        const message = `Sign this message to authenticate with SciFlow.\n\nTimestamp: ${Date.now()}`
        signature = await ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        }) as unknown as string
      }

      const { error } = await signInWithWallet(provider, address, signature)
      
      if (error) {
        throw error
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setWalletConnecting(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 p-4">
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <Card className="relative w-full max-w-md border-0 shadow-clause-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center shadow-lg">
              <FlaskConical className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-navy-800 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to manage your research bounties
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-amber-600 hover:text-amber-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-navy-800 hover:bg-navy-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 border-2"
                onClick={() => handleWalletConnect('solana')}
                disabled={walletConnecting !== null}
              >
                {walletConnecting === 'solana' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xl">◎</span>
                  </div>
                )}
                <div className="text-left">
                  <div className="font-medium">Phantom (Solana)</div>
                  <div className="text-xs text-muted-foreground">Connect with Solana wallet</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 border-2"
                onClick={() => handleWalletConnect('evm')}
                disabled={walletConnecting !== null}
              >
                {walletConnecting === 'evm' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span className="text-xl">🦊</span>
                  </div>
                )}
                <div className="text-left">
                  <div className="font-medium">MetaMask (Base)</div>
                  <div className="text-xs text-muted-foreground">Connect with EVM wallet</div>
                </div>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-0">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-navy-800 px-2 text-muted-foreground">
                New to SciFlow?
              </span>
            </div>
          </div>
          <Link href="/signup" className="w-full">
            <Button variant="outline" className="w-full">
              Create an Account
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
