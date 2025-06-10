export type Asset = {
  id: string
  name: string
  symbol?: string // Ticker for stocks, symbol for crypto (e.g., BTC)
  assetClass: "Stock" | "Crypto"

  // Stock-specific (can be optional)
  type?: "Public" | "Private" // For stocks
  valuationEst?: string // For private stocks

  // Crypto-specific (can be optional)
  blockchain?: string
  marketCap?: number
  circulatingSupply?: number
  maxSupply?: number | null // Can be null if no max supply

  // Common fields
  currentPrice?: number
  priceMovement?: "Up" | "Down" | "Stable"
  shortTermGainPotential: "High" | "Medium" | "Low" | "N/A"
  mediumTermGainPotential: "High" | "Medium" | "Low" | "N/A"
  sentiment: "Positive" | "Neutral" | "Negative"
  keyIndicatorsSummary: string // Can be technical indicators for crypto too
  newsHighlight: string
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Speculative"
  logoUrl?: string
  volume?: number // Daily volume
  buyVolume24h?: number
  sellVolume24h?: number
}
