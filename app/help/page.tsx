import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LifeBuoy } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <LifeBuoy className="h-8 w-8 text-primary" />
            Help & Support - Under Construction
          </CardTitle>
          <CardDescription>The help and support section is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Find FAQs, tutorials, and contact support here soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
