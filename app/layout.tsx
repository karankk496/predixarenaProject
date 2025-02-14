import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import ClientLayout from "@/components/ClientLayout"
import { NextAuthProvider } from '@/providers/auth-provider'
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <NextAuthProvider>
          <ClientLayout>
            <main className="flex-1">
              {children}
            </main>
          </ClientLayout>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
