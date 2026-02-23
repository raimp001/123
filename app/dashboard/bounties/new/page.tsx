"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * /dashboard/bounties/new — redirects to bounties page with create modal hint.
 * The bounties page has the CreateBountyModal; we open it automatically.
 */
export default function NewBountyPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/bounties?create=1")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-sm text-muted-foreground">Opening create bounty...</p>
    </div>
  )
}
