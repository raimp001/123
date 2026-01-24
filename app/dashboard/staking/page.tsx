"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Shield,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  Wallet,
  History,
  Plus,
  Minus,
  ExternalLink
} from "lucide-react"

// Mock staking data
const stakingPool = {
  totalStaked: 52000,
  availableBalance: 25000,
  lockedBalance: 27000,
  slashedTotal: 0,
  currency: "USDC",
  solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
}

const stakingHistory = [
  { id: "st1", type: "deposit", amount: 20000, date: "2026-01-15", status: "confirmed", txHash: "5eykt..." },
  { id: "st2", type: "lock", amount: 15000, bounty: "Novel Antibiotic Discovery", date: "2026-01-18", status: "locked" },
  { id: "st3", type: "deposit", amount: 32000, date: "2026-01-10", status: "confirmed", txHash: "4xGht..." },
  { id: "st4", type: "lock", amount: 12000, bounty: "Quantum Computing Study", date: "2026-01-20", status: "locked" },
  { id: "st5", type: "unlock", amount: 8000, bounty: "Climate Data Analysis", date: "2026-01-08", status: "confirmed" },
]

const activeLocks = [
  { id: "lock1", bounty: "Novel Antibiotic Discovery", amount: 15000, status: "pending_review", proposalId: "prop_001" },
  { id: "lock2", bounty: "Quantum Computing Study", amount: 12000, status: "active", proposalId: "prop_002" },
]

export default function StakingPage() {
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white">Staking Pool</h1>
        <p className="text-muted-foreground mt-1">
          Manage your staked tokens for bounty proposals
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-clause-md md:col-span-2 bg-gradient-to-br from-navy-800 to-navy-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-200 text-sm">Total Staked</p>
                <p className="text-4xl font-bold font-mono mt-1">
                  ${stakingPool.totalStaked.toLocaleString()}
                </p>
                <p className="text-navy-300 text-sm mt-1">{stakingPool.currency}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10">
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Available</p>
                <p className="text-2xl font-bold font-mono text-sage-600 mt-1">
                  ${stakingPool.availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-sage-100 dark:bg-sage-900/30">
                <Unlock className="w-5 h-5 text-sage-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-clause">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Locked</p>
                <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
                  ${stakingPool.lockedBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit/Withdraw Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-0 shadow-clause">
            <CardHeader>
              <CardTitle className="text-lg">Deposit</CardTitle>
              <CardDescription>Add USDC to your staking pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  placeholder="Amount" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="font-mono"
                />
                <Button className="bg-sage-600 hover:bg-sage-500 px-6">
                  <Plus className="w-4 h-4 mr-1" />
                  Deposit
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="w-3.5 h-3.5" />
                Connected: {stakingPool.solanaAddress.slice(0, 6)}...{stakingPool.solanaAddress.slice(-4)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-clause">
            <CardHeader>
              <CardTitle className="text-lg">Withdraw</CardTitle>
              <CardDescription>Withdraw available balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  placeholder="Amount" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="font-mono"
                />
                <Button variant="outline" className="px-6">
                  <Minus className="w-4 h-4 mr-1" />
                  Withdraw
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Available: <span className="font-mono font-medium">${stakingPool.availableBalance.toLocaleString()}</span>
              </p>
            </CardContent>
          </Card>

          {/* Warning Card */}
          <Card className="border-0 shadow-clause bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Slashing Risk</p>
                  <p className="text-amber-700 dark:text-amber-400 mt-1">
                    Locked tokens may be slashed if research misconduct or fraud is detected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Locks & History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Locks */}
          <Card className="border-0 shadow-clause">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Active Locks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeLocks.map((lock) => (
                <div key={lock.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-navy-800 dark:text-white">{lock.bounty}</p>
                    <p className="text-sm text-muted-foreground">
                      {lock.status === "pending_review" ? "Proposal under review" : "Research in progress"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-mono font-semibold text-amber-600">
                      ${lock.amount.toLocaleString()}
                    </p>
                    <Badge variant="outline" className={
                      lock.status === "active" 
                        ? "bg-sage-50 text-sage-700 border-sage-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }>
                      {lock.status === "active" ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
              {activeLocks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No active locks</p>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-0 shadow-clause">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stakingHistory.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === "deposit" ? "bg-sage-100 dark:bg-sage-900/30" :
                      tx.type === "withdraw" || tx.type === "unlock" ? "bg-slate-100 dark:bg-slate-800" :
                      "bg-amber-100 dark:bg-amber-900/30"
                    }`}>
                      {tx.type === "deposit" ? (
                        <ArrowDownRight className="w-4 h-4 text-sage-600" />
                      ) : tx.type === "withdraw" || tx.type === "unlock" ? (
                        <ArrowUpRight className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-navy-800 dark:text-white capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.bounty || tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-mono font-semibold ${
                      tx.type === "deposit" ? "text-sage-600" : 
                      tx.type === "lock" ? "text-amber-600" : "text-slate-600"
                    }`}>
                      {tx.type === "deposit" ? "+" : tx.type === "lock" ? "" : "-"}${tx.amount.toLocaleString()}
                    </p>
                    {tx.txHash && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
