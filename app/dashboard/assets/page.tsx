"use client"

import * as React from "react"
import { mockAssets } from "@/lib/asset-data"
import type { Asset } from "@/types/asset"
import { AssetDataTable } from "@/components/asset-data-table" // Renamed component
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

type GainPotential = Asset["shortTermGainPotential"]
type Recommendation = Asset["recommendation"]
type AssetClass = Asset["assetClass"] | "all"

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [assetClassFilter, setAssetClassFilter] = React.useState<AssetClass>("all")
  const [companyTypeFilter, setCompanyTypeFilter] = React.useState<"all" | "Public" | "Private">("all")
  const [shortTermGainFilter, setShortTermGainFilter] = React.useState<GainPotential | "all">("all")
  const [mediumTermGainFilter, setMediumTermGainFilter] = React.useState<GainPotential | "all">("all")
  const [recommendationFilter, setRecommendationFilter] = React.useState<Recommendation | "all">("all")
  const [minVolumeFilter, setMinVolumeFilter] = React.useState<string>("")
  const [minBuySellRatioFilter, setMinBuySellRatioFilter] = React.useState<string>("")

  const gainOptions: GainPotential[] = ["High", "Medium", "Low", "N/A"]
  const recommendationOptions: Recommendation[] = ["Strong Buy", "Buy", "Hold", "Sell", "Speculative"]

  const filteredAssets = React.useMemo(() => {
    return mockAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.symbol && asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesAssetClass = assetClassFilter === "all" || asset.assetClass === assetClassFilter

      const matchesCompanyType =
        asset.assetClass === "Crypto" || // Don't filter crypto by company type
        companyTypeFilter === "all" ||
        (asset.assetClass === "Stock" && asset.type === companyTypeFilter)

      const matchesShortTermGain = shortTermGainFilter === "all" || asset.shortTermGainPotential === shortTermGainFilter
      const matchesMediumTermGain =
        mediumTermGainFilter === "all" || asset.mediumTermGainPotential === mediumTermGainFilter
      const matchesRecommendation = recommendationFilter === "all" || asset.recommendation === recommendationFilter

      const minVolume = Number.parseFloat(minVolumeFilter)
      const matchesMinVolume = isNaN(minVolume) || minVolume <= 0 || (asset.volume && asset.volume >= minVolume)

      const minBuySellRatio = Number.parseFloat(minBuySellRatioFilter)
      let actualBuySellRatio = -1
      if (asset.buyVolume24h !== undefined && asset.sellVolume24h !== undefined) {
        if (asset.sellVolume24h > 0) {
          actualBuySellRatio = asset.buyVolume24h / asset.sellVolume24h
        } else if (asset.buyVolume24h > 0) {
          actualBuySellRatio = Number.POSITIVE_INFINITY
        }
      }
      const matchesMinBuySellRatio =
        isNaN(minBuySellRatio) ||
        minBuySellRatio <= 0 ||
        actualBuySellRatio === -1 ||
        actualBuySellRatio >= minBuySellRatio

      return (
        matchesSearch &&
        matchesAssetClass &&
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
    assetClassFilter,
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
              placeholder="Search by name or symbol..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs
            value={assetClassFilter}
            onValueChange={(value) => setAssetClassFilter(value as AssetClass)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="Stock">Stocks</TabsTrigger>
              <TabsTrigger value="Crypto">Crypto</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assetClassFilter !== "Crypto" && ( // Hide company type filter for Crypto
            <Select value={companyTypeFilter} onValueChange={(value) => setCompanyTypeFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Company Type (Stocks)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Types</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
              </SelectContent>
            </Select>
          )}
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
              Min. Volume (24h)
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
      <AssetDataTable data={filteredAssets} />
    </div>
  )
}
