"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
        localStorage.removeItem('token')
        router.push('/login')
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dashboard</CardTitle>
            <Button 
              variant="outline" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Welcome, {user.displayName || user.email}!</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Profile Information</h3>
                  <p>Email: {user.email}</p>
                  {user.firstName && <p>First Name: {user.firstName}</p>}
                  {user.lastName && <p>Last Name: {user.lastName}</p>}
                  {user.displayName && <p>Display Name: {user.displayName}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 