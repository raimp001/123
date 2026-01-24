import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Auth pages don't need sidebar
  return children
}
