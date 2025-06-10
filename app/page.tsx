import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Stock Tracker</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Navigate to the dashboard to view and manage your stock information.
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard/stocks">Go to Stocks Dashboard</Link>
      </Button>
    </div>
  )
}
