"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { Snackbar } from "@mui/material"
import { Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserData {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  role: string
  isSuperUser: boolean
  createdAt?: string
  updatedAt?: string
}

export default function AccountPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token')
      const storedUserData = localStorage.getItem('userData')

      if (!token || !storedUserData) {
        router.push('/login')
        return
      }

      try {
        // First set the stored data
        const parsedUserData = JSON.parse(storedUserData)
        setUserData(parsedUserData)
        
        // Artificial delay of 3 seconds
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Then fetch fresh data
        const response = await fetch(`/api/user/profile?userId=${parsedUserData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        if (data && data.user) {
          setUserData(data.user)
          localStorage.setItem('userData', JSON.stringify(data.user))
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setSnackbarMessage('Failed to load user data')
        setOpenSnackbar(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Account Details</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Loading user details...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch your information</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8">
          <Card className="shadow-lg">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-muted-foreground">No user data available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">Account Details</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg">
                  {userData.firstName?.[0]}{userData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">
                  {userData.displayName || `${userData.firstName} ${userData.lastName}` || 'User'}
                </h2>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>
            </div>

            <Separator />

            {/* User Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                  <p className="text-lg">{userData.firstName || 'Not set'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                  <p className="text-lg">{userData.lastName || 'Not set'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Display Name</h3>
                  <p className="text-lg">{userData.displayName || 'Not set'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                  <p className="text-lg capitalize">{userData.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                  <p className="text-lg">{userData.isSuperUser ? 'Super User' : 'Regular User'}</p>
                </div>
                {userData.createdAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                    <p className="text-lg">{new Date(userData.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </div>
  )
} 