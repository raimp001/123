import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Construction className="h-8 w-8 text-primary" />
            Analytics - Under Construction
          </CardTitle>
          <CardDescription>
            This page is currently under development. Please check back later for advanced analytics features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">We are working hard to bring you insightful data visualizations!</p>
        </CardContent>
      </Card>
    </div>
  )
}
