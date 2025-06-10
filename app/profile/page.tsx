import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { UserCircle } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <UserCircle className="h-8 w-8 text-primary" />
            Profile - Under Construction
          </CardTitle>
          <CardDescription>Your profile page is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User settings and profile information will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
