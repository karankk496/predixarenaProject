"use client"

import { useConfig } from "@/hooks/useConfig"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const config = useConfig()
  
  return (
    <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 