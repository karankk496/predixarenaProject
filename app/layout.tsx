import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import ClientLayout from "@/components/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ClientLayout>
          <main className="flex-1">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  )
}
