import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Briefcase, BarChart2 } from "lucide-react"

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
      <p className="text-muted-foreground">
        Welcome to your stock tracking dashboard. Here you can get an overview and navigate to different sections.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Stocks
            </CardTitle>
            <CardDescription>View and manage your tracked public and private company stocks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/stocks">Go to Stocks</Link>
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
