export type Stock = {
  id: string
  name: string
  ticker?: string
  type: "Public" | "Private"
  currentPrice?: number
  valuationEst?: string
  priceMovement?: "Up" | "Down" | "Stable"
  shortTermGainPotential: "High" | "Medium" | "Low" | "N/A"
  mediumTermGainPotential: "High" | "Medium" | "Low" | "N/A"
  sentiment: "Positive" | "Neutral" | "Negative"
  keyIndicatorsSummary: string
  newsHighlight: string
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Speculative"
  logoUrl?: string
  // New fields
  volume?: number // Daily volume for public stocks
  buyVolume24h?: number // Buy volume in the last 24 hours
  sellVolume24h?: number // Sell volume in the last 24 hours
}
