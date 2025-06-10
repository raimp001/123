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
} from "lucide-react"
import type { Stock } from "@/types/stock"

const getGainBadgeVariant = (
  gain: Stock["shortTermGainPotential"],
): "default" | "secondary" | "destructive" | "outline" => {
  switch (gain) {
    case "High":
      return "default" // Greenish in default theme
    case "Medium":
      return "secondary" // Bluish/Yellowish
    case "Low":
      return "destructive" // Reddish
    case "N/A":
      return "outline"
    default:
      return "outline"
  }
}

const getSentimentIcon = (sentiment: Stock["sentiment"]) => {
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
  recommendation: Stock["recommendation"],
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
      return "outline" // Or a unique color
    default:
      return "outline"
  }
}

export const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.original
      return (
        <div className="flex items-center gap-2">
          {stock.logoUrl && (
            <Image
              src={stock.logoUrl || "/placeholder.svg"}
              alt={`${stock.name} logo`}
              width={24}
              height={24}
              className="rounded-sm"
            />
          )}
          <div>
            <div className="font-medium">{stock.name}</div>
            {stock.ticker && <div className="text-xs text-muted-foreground">{stock.ticker}</div>}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "Public" ? "outline" : "secondary"}>{row.original.type}</Badge>
    ),
  },
  {
    accessorKey: "currentPrice",
    header: "Price/Valuation",
    cell: ({ row }) => {
      const stock = row.original
      const movementIcon =
        stock.priceMovement === "Up" ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : stock.priceMovement === "Down" ? (
          <ArrowDown className="h-4 w-4 text-red-500" />
        ) : (
          <Minus className="h-4 w-4 text-gray-500" />
        )
      return (
        <div className="flex items-center gap-1">
          {stock.type === "Public" ? `$${stock.currentPrice?.toFixed(2)}` : stock.valuationEst}
          {movementIcon}
        </div>
      )
    },
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Volume
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const volume = row.original.volume
      if (volume === undefined || volume === null) return <span className="text-muted-foreground">N/A</span>
      return <div className="text-right">{volume.toLocaleString()}</div>
    },
    sortingFn: "alphanumeric", // Ensure numbers sort correctly
  },
  {
    id: "buySellRatio24h", // Custom ID as it's a calculated value
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Buy/Sell (24h)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => {
      // Calculate ratio for sorting and display
      if (row.buyVolume24h !== undefined && row.sellVolume24h !== undefined) {
        if (row.sellVolume24h > 0) {
          return row.buyVolume24h / row.sellVolume24h
        } else if (row.buyVolume24h > 0) {
          return Number.POSITIVE_INFINITY // Represents a very high ratio
        }
      }
      return null // Or undefined, or a specific value for N/A
    },
    cell: ({ getValue }) => {
      const ratio = getValue<number | null>()
      if (ratio === null || ratio === undefined) return <span className="text-muted-foreground">N/A</span>
      if (ratio === Number.POSITIVE_INFINITY) return <span className="text-green-500 font-semibold">∞</span>
      return (
        <div
          className={`text-right font-medium ${ratio >= 1.5 ? "text-green-600" : ratio < 0.8 ? "text-red-600" : ""}`}
        >
          {ratio.toFixed(2)}
        </div>
      )
    },
    sortingFn: "alphanumeric", // Ensure numbers (and Infinity) sort correctly
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
    accessorKey: "keyIndicatorsSummary",
    header: "Indicators",
    cell: ({ row }) => (
      <div className="text-xs max-w-xs truncate" title={row.original.keyIndicatorsSummary}>
        {row.original.keyIndicatorsSummary}
      </div>
    ),
  },
  {
    accessorKey: "newsHighlight",
    header: "News",
    cell: ({ row }) => (
      <div className="text-xs max-w-xs truncate" title={row.original.newsHighlight}>
        {row.original.newsHighlight}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stock = row.original
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
            <DropdownMenuItem onClick={() => alert(`Viewing details for ${stock.name}`)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Adding ${stock.name} to watchlist`)}>
              Add to Watchlist
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Trading ${stock.name}`)}>Trade</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface StockDataTableProps {
  data: Stock[]
}

export function StockDataTable({ data }: StockDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
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
