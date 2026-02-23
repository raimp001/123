"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Lock,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function SettingsPage() {
  const { isAuthenticated } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailBountyUpdates: true,
    emailProposals: true,
    emailMilestones: true,
    emailDisputes: true,
    pushEnabled: false,
  })

  // Display preferences
  const [display, setDisplay] = useState({
    currency: "USD",
    language: "en",
    timezone: "UTC",
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign in to access settings
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create an account or sign in to customize your notifications, security, and display preferences.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="border-border text-foreground hover:bg-secondary">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : isSaving ? (
            "Saving..."
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Notifications */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Bounty updates</Label>
              <p className="text-sm text-muted-foreground">Status changes for your bounties</p>
            </div>
            <Switch
              checked={notifications.emailBountyUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailBountyUpdates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">New proposals</Label>
              <p className="text-sm text-muted-foreground">When labs submit proposals</p>
            </div>
            <Switch
              checked={notifications.emailProposals}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailProposals: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Milestone updates</Label>
              <p className="text-sm text-muted-foreground">Progress on active research</p>
            </div>
            <Switch
              checked={notifications.emailMilestones}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailMilestones: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Dispute notifications</Label>
              <p className="text-sm text-muted-foreground">Important dispute updates</p>
            </div>
            <Switch
              checked={notifications.emailDisputes}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailDisputes: checked })
              }
            />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Push notifications
                </Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={notifications.pushEnabled}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, pushEnabled: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Display
          </CardTitle>
          <CardDescription>Customize how information is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-foreground">Currency</Label>
            <Select
              value={display.currency}
              onValueChange={(value) => setDisplay({ ...display, currency: value })}
            >
              <SelectTrigger className="mt-1 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground">
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Language</Label>
            <Select
              value={display.language}
              onValueChange={(value) => setDisplay({ ...display, language: value })}
            >
              <SelectTrigger className="mt-1 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Timezone</Label>
            <Select
              value={display.timezone}
              onValueChange={(value) => setDisplay({ ...display, timezone: value })}
            >
              <SelectTrigger className="mt-1 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground">
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Last changed: Never</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-background">
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">Not enabled</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-background">
              Enable
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Active sessions</p>
                <p className="text-sm text-muted-foreground">1 active session</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-background">
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage payment and payout methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CreditCard className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No payment methods added</p>
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <div>
              <p className="font-medium text-foreground">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
