import type React from "react"

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="events-layout">
      <main>{children}</main>
    </div>
  )
}

