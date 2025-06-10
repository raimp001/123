"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar" // Assuming sidebar components are in ui
import { Home, Briefcase, BarChart2, Settings, UserCircle, LifeBuoy } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar" // Assuming useSidebar is exported

// Menu items.
const mainMenuItems = [
  { title: "Overview", url: "/dashboard", icon: Home },
  { title: "Stocks", url: "/dashboard/stocks", icon: Briefcase },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart2 },
]

const accountMenuItems = [
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: LifeBuoy },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state: sidebarState } = useSidebar() // Get sidebar state

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader className="p-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold px-2">
          <Briefcase className="h-6 w-6" />
          {sidebarState === "expanded" && <span>StockTrack</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {accountMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
