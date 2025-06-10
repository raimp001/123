import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings - Under Construction
          </CardTitle>
          <CardDescription>Application settings page is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customize your application experience here in the future.</p>
        </CardContent>
      </Card>
    </div>
  )
}
