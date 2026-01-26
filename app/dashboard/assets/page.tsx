"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function AssetsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-foreground">Assets</h1>
        <p className="text-sm text-muted-foreground">Track your assets and investments</p>
      </div>

      <Card className="bg-card border-border rounded-xl">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium text-foreground mb-2">No assets to display</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Asset tracking will be available once you have active escrows or earnings from completed bounties.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
