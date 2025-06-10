"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import * as React from "react"
import Image from "next/image"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Coins,
  Building,
} from "lucide-react"
import type { Asset } from "@/types/asset" // Renamed type

const getGainBadgeVariant = (
  gain: Asset["shortTermGainPotential"],
): "default" | "secondary" | "destructive" | "outline" => {
  switch (gain) {
    case "High":
      return "default"
    case "Medium":
      return "secondary"
    case "Low":
      return "destructive"
    case "N/A":
      return "outline"
    default:
      return "outline"
  }
}

const getSentimentIcon = (sentiment: Asset["sentiment"]) => {
  switch (sentiment) {
    case "Positive":
      return <ThumbsUp className="h-4 w-4 text-green-500" />
    case "Neutral":
      return <Meh className="h-4 w-4 text-yellow-500" />
    case "Negative":
      return <ThumbsDown className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}

const getRecommendationVariant = (
  recommendation: Asset["recommendation"],
): "default" | "secondary" | "destructive" | "outline" => {
  switch (recommendation) {
    case "Strong Buy":
    case "Buy":
      return "default"
    case "Hold":
      return "secondary"
    case "Sell":
      return "destructive"
    case "Speculative":
      return "outline"
    default:
      return "outline"
  }
}

const formatMarketCap = (value?: number) => {
  if (value === undefined || value === null) return "N/A"
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  return value.toLocaleString()
}

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const asset = row.original
      return (
        <div className="flex items-center gap-2">
          {asset.logoUrl && (
            <Image
              src={asset.logoUrl || "/placeholder.svg"}
              alt={`${asset.name} logo`}
              width={24}
              height={24}
              className="rounded-sm"
            />
          )}
          <div>
            <div className="font-medium">{asset.name}</div>
            {asset.symbol && <div className="text-xs text-muted-foreground">{asset.symbol}</div>}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "assetClass",
    header: "Asset Class",
    cell: ({ row }) => {
      const assetClass = row.original.assetClass
      const icon = assetClass === "Stock" ? <Building className="h-4 w-4 mr-1" /> : <Coins className="h-4 w-4 mr-1" />
      return (
        <Badge variant={assetClass === "Stock" ? "secondary" : "outline"} className="flex items-center">
          {icon}
          {assetClass}
        </Badge>
      )
    },
  },
  {
    accessorKey: "currentPrice",
    header: "Price/Valuation",
    cell: ({ row }) => {
      const asset = row.original
      const movementIcon =
        asset.priceMovement === "Up" ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : asset.priceMovement === "Down" ? (
          <ArrowDown className="h-4 w-4 text-red-500" />
        ) : (
          <Minus className="h-4 w-4 text-gray-500" />
        )

      let displayValue = "N/A"
      if (asset.assetClass === "Stock") {
        displayValue =
          asset.type === "Public" && asset.currentPrice !== undefined
            ? `$${asset.currentPrice.toFixed(2)}`
            : asset.valuationEst || "N/A"
      } else if (asset.assetClass === "Crypto" && asset.currentPrice !== undefined) {
        displayValue = `$${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.currentPrice < 1 ? 8 : 2 })}`
      }

      return (
        <div className="flex items-center gap-1">
          {displayValue}
          {movementIcon}
        </div>
      )
    },
  },
  {
    accessorKey: "marketCap",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Market Cap
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (asset.assetClass === "Crypto") {
        return <div className="text-right">{formatMarketCap(asset.marketCap)}</div>
      }
      return <span className="text-muted-foreground text-right">N/A</span>
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Volume (24h)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const volume = row.original.volume
      if (volume === undefined || volume === null) return <span className="text-muted-foreground text-right">N/A</span>
      return <div className="text-right">{formatMarketCap(volume)}</div> // Use formatMarketCap for large volume numbers
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "buySellRatio24h",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Buy/Sell (24h)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => {
      if (row.buyVolume24h !== undefined && row.sellVolume24h !== undefined) {
        if (row.sellVolume24h > 0) return row.buyVolume24h / row.sellVolume24h
        else if (row.buyVolume24h > 0) return Number.POSITIVE_INFINITY
      }
      return null
    },
    cell: ({ getValue }) => {
      const ratio = getValue<number | null>()
      if (ratio === null || ratio === undefined) return <span className="text-muted-foreground text-right">N/A</span>
      if (ratio === Number.POSITIVE_INFINITY) return <span className="text-green-500 font-semibold text-right">∞</span>
      return (
        <div
          className={`text-right font-medium ${ratio >= 1.5 ? "text-green-600" : ratio < 0.8 ? "text-red-600" : ""}`}
        >
          {ratio.toFixed(2)}
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "shortTermGainPotential",
    header: "Short-Term",
    cell: ({ row }) => (
      <Badge variant={getGainBadgeVariant(row.original.shortTermGainPotential)}>
        {row.original.shortTermGainPotential}
      </Badge>
    ),
  },
  {
    accessorKey: "mediumTermGainPotential",
    header: "Medium-Term",
    cell: ({ row }) => (
      <Badge variant={getGainBadgeVariant(row.original.mediumTermGainPotential)}>
        {row.original.mediumTermGainPotential}
      </Badge>
    ),
  },
  {
    accessorKey: "sentiment",
    header: "Sentiment",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {getSentimentIcon(row.original.sentiment)}
        <span>{row.original.sentiment}</span>
      </div>
    ),
  },
  {
    accessorKey: "recommendation",
    header: "Recommendation",
    cell: ({ row }) => (
      <Badge variant={getRecommendationVariant(row.original.recommendation)}>{row.original.recommendation}</Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const asset = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => alert(`Viewing details for ${asset.name}`)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Adding ${asset.name} to watchlist`)}>
              Add to Watchlist
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Trading ${asset.name}`)}>Trade</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface AssetDataTableProps {
  data: Asset[]
}

export function AssetDataTable({ data }: AssetDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    keyIndicatorsSummary: false, // Hide by default
    newsHighlight: false, // Hide by default
  })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                let columnName = column.id.replace(/([A-Z])/g, " $1")
                if (column.id === "keyIndicatorsSummary") columnName = "Indicators"
                if (column.id === "newsHighlight") columnName = "News"
                if (column.id === "buySellRatio24h") columnName = "Buy/Sell (24h)"
                if (column.id === "assetClass") columnName = "Asset Class"
                if (column.id === "marketCap") columnName = "Market Cap"
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {columnName}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
