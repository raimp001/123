"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Lock, 
  Unlock,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  TrendingUp
} from "lucide-react"

// Mock escrow data
const escrowAccounts = [
  {
    id: "escrow_001",
    bountyId: "bounty_001",
    bountyTitle: "Novel Protein Folding Analysis",
    method: "solana_usdc",
    totalAmount: 125000,
    releasedAmount: 62500,
    currency: "USDC",
    status: "locked",
    labName: "Stanford Neuroscience Lab",
    escrowAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    txSignature: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d...",
    lockedAt: "2025-12-15T10:30:00Z",
    milestones: [
      { id: "m1", title: "Initial Data Collection", amount: 31250, status: "released", releasedAt: "2026-01-05" },
      { id: "m2", title: "Analysis Phase 1", amount: 31250, status: "released", releasedAt: "2026-01-20" },
      { id: "m3", title: "Model Validation", amount: 31250, status: "pending" },
      { id: "m4", title: "Final Report", amount: 31250, status: "pending" },
    ],
  },
  {
    id: "escrow_002",
    bountyId: "bounty_002",
    bountyTitle: "mRNA Stability Enhancement",
    method: "stripe",
    totalAmount: 85000,
    releasedAmount: 51000,
    currency: "USD",
    status: "locked",
    labName: "BioTech Solutions Inc.",
    stripePaymentIntent: "pi_3MqL6TKZ8LqYzNmN0xGF8qL9",
    lockedAt: "2025-11-28T14:20:00Z",
    milestones: [
      { id: "m1", title: "Literature Review", amount: 17000, status: "released", releasedAt: "2025-12-15" },
      { id: "m2", title: "Experimental Design", amount: 17000, status: "released", releasedAt: "2026-01-02" },
      { id: "m3", title: "Lab Trials", amount: 17000, status: "released", releasedAt: "2026-01-18" },
      { id: "m4", title: "Analysis", amount: 17000, status: "in_review" },
      { id: "m5", title: "Publication Draft", amount: 17000, status: "pending" },
    ],
  },
  {
    id: "escrow_003",
    bountyId: "bounty_003",
    bountyTitle: "CRISPR Gene Therapy Efficacy",
    method: "base_usdc",
    totalAmount: 200000,
    releasedAmount: 0,
    currency: "USDC",
    status: "locked",
    labName: null,
    contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f8bD2a",
    txHash: "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
    lockedAt: "2026-01-10T09:15:00Z",
    milestones: [],
  },
]

const recentTransactions = [
  { id: "tx1", type: "release", amount: 31250, currency: "USDC", bounty: "Protein Folding", date: "2026-01-20", status: "confirmed" },
  { id: "tx2", type: "deposit", amount: 200000, currency: "USDC", bounty: "CRISPR Study", date: "2026-01-10", status: "confirmed" },
  { id: "tx3", type: "release", amount: 17000, currency: "USD", bounty: "mRNA Stability", date: "2026-01-18", status: "confirmed" },
  { id: "tx4", type: "release", amount: 17000, currency: "USD", bounty: "mRNA Stability", date: "2026-01-02", status: "confirmed" },
]

function EscrowCard({ escrow }: { escrow: typeof escrowAccounts[0] }) {
  const progress = (escrow.releasedAmount / escrow.totalAmount) * 100
  const methodLabels: Record<string, { label: string; icon: React.ElementType }> = {
    stripe: { label: "Stripe (Fiat)", icon: CreditCard },
    solana_usdc: { label: "Solana USDC", icon: Wallet },
    base_usdc: { label: "Base USDC", icon: Wallet },
  }
  const method = methodLabels[escrow.method]
  const MethodIcon = method.icon

  return (
    <Card className="border-0 shadow-clause-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{escrow.bountyTitle}</CardTitle>
            <CardDescription className="mt-1">
              {escrow.labName || "Awaiting lab assignment"}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={escrow.status === "locked" 
              ? "bg-amber-50 text-amber-700 border-amber-200" 
              : "bg-sage-50 text-sage-700 border-sage-200"
            }
          >
            {escrow.status === "locked" ? (
              <><Lock className="w-3 h-3 mr-1" /> Locked</>
            ) : (
              <><Unlock className="w-3 h-3 mr-1" /> Released</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Escrow Balance</p>
            <p className="text-3xl font-bold font-mono text-navy-800 dark:text-white">
              {escrow.currency === "USD" ? "$" : ""}{(escrow.totalAmount - escrow.releasedAmount).toLocaleString()}
              <span className="text-lg text-muted-foreground ml-1">{escrow.currency}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Released</p>
            <p className="text-lg font-mono text-sage-600">
              {escrow.currency === "USD" ? "$" : ""}{escrow.releasedAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Release Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sage-500 to-sage-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex items-center justify-between py-3 border-t border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MethodIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{method.label}</span>
          </div>
          {escrow.escrowAddress && (
            <div className="flex items-center gap-1">
              <code className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {escrow.escrowAddress.slice(0, 8)}...{escrow.escrowAddress.slice(-6)}
              </code>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          )}
          {escrow.contractAddress && (
            <div className="flex items-center gap-1">
              <code className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {escrow.contractAddress.slice(0, 8)}...{escrow.contractAddress.slice(-6)}
              </code>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Milestones */}
        {escrow.milestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-navy-800 dark:text-white">Milestones</p>
            {escrow.milestones.map((milestone, idx) => (
              <div key={milestone.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {milestone.status === "released" ? (
                    <CheckCircle2 className="w-4 h-4 text-sage-500" />
                  ) : milestone.status === "in_review" ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                  )}
                  <span className={milestone.status === "released" ? "text-muted-foreground" : "text-navy-700 dark:text-slate-300"}>
                    {milestone.title}
                  </span>
                </div>
                <span className="font-mono text-xs">
                  ${milestone.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" size="sm">
            View Details
          </Button>
          {escrow.milestones.some(m => m.status === "in_review") && (
            <Button className="flex-1 bg-sage-600 hover:bg-sage-500" size="sm">
              Review Milestone
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function EscrowPage() {
  const totalLocked = escrowAccounts.reduce((sum, e) => sum + (e.totalAmount - e.releasedAmount), 0)
  const totalReleased = escrowAccounts.reduce((sum, e) => sum + e.releasedAmount, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Escrow Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage your escrowed funds
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-clause-md bg-gradient-to-br from-navy-800 to-navy-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-200 text-sm">Total Locked</p>
                <p className="text-3xl font-bold font-mono mt-1">
                  ${totalLocked.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/10">
                <Lock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Released</p>
                <p className="text-3xl font-bold font-mono text-sage-600 mt-1">
                  ${totalReleased.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sage-100 dark:bg-sage-900/30">
                <TrendingUp className="w-6 h-6 text-sage-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Escrows</p>
                <p className="text-3xl font-bold text-navy-800 dark:text-white mt-1">
                  {escrowAccounts.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Escrows</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {escrowAccounts.map((escrow, index) => (
              <div 
                key={escrow.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EscrowCard escrow={escrow} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3">
          {recentTransactions.map((tx, index) => (
            <Card 
              key={tx.id} 
              className="border-0 shadow-clause animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === "deposit" 
                      ? "bg-amber-100 dark:bg-amber-900/30" 
                      : "bg-sage-100 dark:bg-sage-900/30"
                  }`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownRight className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-sage-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-navy-800 dark:text-white capitalize">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">{tx.bounty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold ${
                    tx.type === "deposit" ? "text-amber-600" : "text-sage-600"
                  }`}>
                    {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()} {tx.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <Badge variant="outline" className="bg-sage-50 text-sage-700 border-sage-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Confirmed
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
