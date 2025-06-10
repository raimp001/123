"use client"

import * as React from "react"
import { mockStocks } from "@/lib/stock-data"
import type { Stock } from "@/types/stock"
import { StockDataTable } from "@/components/stock-data-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

type GainPotential = Stock["shortTermGainPotential"]
type Recommendation = Stock["recommendation"]

export default function StocksPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [companyTypeFilter, setCompanyTypeFilter] = React.useState<"all" | "Public" | "Private">("all")
  const [shortTermGainFilter, setShortTermGainFilter] = React.useState<GainPotential | "all">("all")
  const [mediumTermGainFilter, setMediumTermGainFilter] = React.useState<GainPotential | "all">("all")
  const [recommendationFilter, setRecommendationFilter] = React.useState<Recommendation | "all">("all")
  const [minVolumeFilter, setMinVolumeFilter] = React.useState<string>("") // Store as string for input
  const [minBuySellRatioFilter, setMinBuySellRatioFilter] = React.useState<string>("") // Store as string for input

  const gainOptions: GainPotential[] = ["High", "Medium", "Low", "N/A"]
  const recommendationOptions: Recommendation[] = ["Strong Buy", "Buy", "Hold", "Sell", "Speculative"]

  const filteredStocks = React.useMemo(() => {
    return mockStocks.filter((stock) => {
      const matchesSearch =
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.ticker && stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCompanyType = companyTypeFilter === "all" || stock.type === companyTypeFilter
      const matchesShortTermGain = shortTermGainFilter === "all" || stock.shortTermGainPotential === shortTermGainFilter
      const matchesMediumTermGain =
        mediumTermGainFilter === "all" || stock.mediumTermGainPotential === mediumTermGainFilter
      const matchesRecommendation = recommendationFilter === "all" || stock.recommendation === recommendationFilter

      const minVolume = Number.parseFloat(minVolumeFilter)
      const matchesMinVolume =
        isNaN(minVolume) || minVolume <= 0 || (stock.volume && stock.volume >= minVolume) || stock.type === "Private" // Or however you want to handle private companies for volume

      const minBuySellRatio = Number.parseFloat(minBuySellRatioFilter)
      let actualBuySellRatio = -1 // Default if not calculable
      if (stock.buyVolume24h !== undefined && stock.sellVolume24h !== undefined) {
        if (stock.sellVolume24h > 0) {
          actualBuySellRatio = stock.buyVolume24h / stock.sellVolume24h
        } else if (stock.buyVolume24h > 0) {
          actualBuySellRatio = Number.POSITIVE_INFINITY // Effectively very high if buy but no sell
        }
      }

      const matchesMinBuySellRatio =
        isNaN(minBuySellRatio) ||
        minBuySellRatio <= 0 ||
        actualBuySellRatio === -1 || // If not applicable, don't filter out
        actualBuySellRatio >= minBuySellRatio ||
        stock.type === "Private" // Or handle private companies

      return (
        matchesSearch &&
        matchesCompanyType &&
        matchesShortTermGain &&
        matchesMediumTermGain &&
        matchesRecommendation &&
        matchesMinVolume &&
        matchesMinBuySellRatio
      )
    })
  }, [
    searchTerm,
    companyTypeFilter,
    shortTermGainFilter,
    mediumTermGainFilter,
    recommendationFilter,
    minVolumeFilter,
    minBuySellRatioFilter,
  ])

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or ticker..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs
            value={companyTypeFilter}
            onValueChange={(value) => setCompanyTypeFilter(value as any)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Public">Public</TabsTrigger>
              <TabsTrigger value="Private">Private</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select value={shortTermGainFilter} onValueChange={(value) => setShortTermGainFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Short-Term Gain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Short-Term Gains</SelectItem>
              {gainOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mediumTermGainFilter} onValueChange={(value) => setMediumTermGainFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Medium-Term Gain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Medium-Term Gains</SelectItem>
              {gainOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={recommendationFilter} onValueChange={(value) => setRecommendationFilter(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Recommendation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recommendations</SelectItem>
              {recommendationOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="minVolume" className="block text-sm font-medium text-muted-foreground mb-1">
              Min. Volume
            </label>
            <Input
              id="minVolume"
              type="number"
              placeholder="e.g., 100000"
              value={minVolumeFilter}
              onChange={(e) => setMinVolumeFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="minBuySellRatio" className="block text-sm font-medium text-muted-foreground mb-1">
              Min. Buy/Sell Ratio (24h)
            </label>
            <Input
              id="minBuySellRatio"
              type="number"
              placeholder="e.g., 1.5"
              step="0.1"
              value={minBuySellRatioFilter}
              onChange={(e) => setMinBuySellRatioFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <StockDataTable data={filteredStocks} />
    </div>
  )
}
