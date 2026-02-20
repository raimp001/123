"use client"

import { type ReactNode, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { base } from 'viem/chains'
import { AuthProvider } from '@/contexts/auth-context'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'placeholder-set-privy-app-id'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
    },
  }))

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: 'hsl(20, 70%, 55%)', // matches --accent
          logo: '/icon.png',
          showWalletLoginFirst: true,
          walletChainType: 'ethereum-only',
          landingHeader: 'Sign in to SciFlow',
          loginMessage: 'Fund breakthrough research. Pay only on proof.',
        },
        defaultChain: base,
        supportedChains: [base],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: true,
        },
        fundingMethodConfig: {
          moonpay: { useSandbox: false },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
          {children}
          </AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
