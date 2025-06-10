import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Coins, BarChart2 } from "lucide-react" // Changed Briefcase to Coins

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
      <p className="text-muted-foreground">
        Welcome to your asset tracking dashboard. Here you can get an overview and navigate to different sections.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" /> {/* Changed icon */}
              Assets
            </CardTitle>
            <CardDescription>View and manage your tracked stocks and cryptocurrencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/assets">Go to Assets</Link> {/* Updated link */}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Analytics (Coming Soon)
            </CardTitle>
            <CardDescription>
              Analyze trends and performance of your portfolio. This section is under development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>View Analytics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
