"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { MoreHorizontal, Search, Settings, User, Globe, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Snackbar } from "@mui/material"

interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  role: string;
  isSuperUser: boolean;
}

export default function Page() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');
      
      if (!token || !storedUserData) {
        setUserData(null);
        return;
      }

      try {
        const parsedUserData = JSON.parse(storedUserData);
        
        if (!parsedUserData || !parsedUserData.id || !parsedUserData.email) {
          throw new Error('Invalid user data structure');
        }

        setUserData(parsedUserData);
        
        fetch(`/api/user/profile?userId=${parsedUserData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.user) {
            const validUserData = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName || null,
              lastName: data.user.lastName || null,
              displayName: data.user.displayName || null,
              role: data.user.role,
              isSuperUser: Boolean(data.user.isSuperUser)
            };
            setUserData(validUserData);
            localStorage.setItem('userData', JSON.stringify(validUserData));
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          // Keep existing user data on fetch error
          toast.error('Failed to update profile data');
        });
      } catch (error) {
        console.error('Error in auth check:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        setUserData(null);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array since we don't need to re-run on router changes

  const handleLogout = () => {
    try {
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      
      // Clear user state
      setUserData(null)
      
      // Show success message
      setSnackbarMessage('You have been successfully logged out!')
      setOpenSnackbar(true)
      
      // Redirect to home after a short delay to ensure message is shown
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Logout error:', error)
      setSnackbarMessage('Error during logout')
      setOpenSnackbar(true)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-white z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="w-60 flex items-center pl-8">
            <Link href="/" className="text-xl font-semibold">
              PredixArena
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-[400px] relative">
              <Input type="search" placeholder="Search markets or people" className="w-full pr-10" />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {userData.displayName || `${userData.firstName} ${userData.lastName}` || userData.email}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {userData.role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="flex items-center gap-2">
                    <Link href="/account">
                      <User className="w-4 h-4" />
                      <span>Account details</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {userData?.isSuperUser && (
                    <DropdownMenuItem>
                      <Link href="/manageusers" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Manage Users</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild className="flex items-center gap-2">
                    <Link href="/language">
                      <Globe className="w-4 h-4" />
                      <span>Change language</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="flex items-center gap-2">
                    <Link href="/about">
                      <User className="w-4 h-4" />
                      <span>About PredixArena</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <nav className="container h-12 flex items-center gap-6 text-sm">
          <div className="w-60 pl-8"></div>
          <div className="flex-1 flex items-center justify-center gap-6">
            <Link href="#" className="text-red-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              LIVE
            </Link>
            {[
              "All",
              "New",
              "Creators",
              "Sports",
              "Global Elections",
              "Mentions",
              "Politics",
              "Crypto",
              "Pop Culture",
              "Business",
              "Science",
            ].map((item) => (
              <Link key={item} href="#" className="text-muted-foreground hover:text-foreground">
                {item}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container py-6 grid grid-cols-[240px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-2">
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17 9.5L10 2.5L3 9.5"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 8.5V16.5C4 16.7652 4.10536 17.0196 4.29289 17.2071C4.48043 17.3946 4.73478 17.5 5 17.5H15C15.2652 17.5 15.5196 17.3946 15.7071 17.2071C15.8946 17.0196 16 16.7652 16 16.5V8.5"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            LEARN
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.5 9.5L2.5 12.5V17.5H7.5L10.5 14.5"
                stroke="#FFA500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.5 10.5L17.5 7.5V2.5H12.5L9.5 5.5"
                stroke="#FFA500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 7.5L12.5 12.5"
                stroke="#FFA500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5 7.5L7.5 12.5"
                stroke="#FFA500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            LEADERBOARDS
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.5 10C16.5 13.5899 13.5899 16.5 10 16.5C6.41015 16.5 3.5 13.5899 3.5 10C3.5 6.41015 6.41015 3.5 10 3.5C13.5899 3.5 16.5 6.41015 16.5 10Z"
                stroke="#FF69B4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M10 7.5V12.5" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.5 10H12.5" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            QUESTS
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 9V7C4 4.79086 5.79086 3 8 3H12C14.2091 3 16 4.79086 16 7V9"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 9H4C2.89543 9 2 9.89543 2 11V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V11C18 9.89543 17.1046 9 16 9Z"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            SHOP
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.5 17.5V15.8333C16.5 14.9493 16.1488 14.1014 15.5237 13.4763C14.8986 12.8512 14.0507 12.5 13.1667 12.5H6.83333C5.94928 12.5 5.10143 12.8512 4.47631 13.4763C3.85119 14.1014 3.5 14.9493 3.5 15.8333V17.5"
                stroke="#9C27B0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9.16667C11.841 9.16667 13.3333 7.67428 13.3333 5.83333C13.3333 3.99238 11.841 2.5 10 2.5C8.15905 2.5 6.66667 3.99238 6.66667 5.83333C6.66667 7.67428 8.15905 9.16667 10 9.16667Z"
                stroke="#9C27B0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            PROFILE
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground">
            <MoreHorizontal className="w-5 h-5" />
            MORE
          </Link>
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Featured Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#4A5AB9] text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">2024 Election Results</h3>
                <Button variant="secondary" size="sm">
                  View
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-[#8250C4] text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Mention Markets</h3>
                <p className="mb-4">What will they say?</p>
                <Button variant="secondary" size="sm">
                  Trade now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* New Event Management Links */}
          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/events/create">Create New Event</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/events/new-event">New Event (Alternative)</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/events">View All Events</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/vote">Vote on Predictions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/approve-events">Approve Events</Link>
            </Button>
          </div>

          {/* Prediction Markets */}
          <div className="grid gap-4">
            <PredictionMarket
              title="Who will be Trump's Secretary of Agriculture?"
              options={[
                { name: "Brooke Rollins", percentage: "94%" },
                { name: "Kelly Loeffler", percentage: "2%" },
              ]}
              value="$714,908"
            />
            <PredictionMarket
              title="Who will be Trump's Secretary of Labor?"
              options={[
                { name: "Lori Chavez-DeRemer", percentage: "92%" },
                { name: "Brandon Williams", percentage: "2%" },
              ]}
              value="$207,324"
            />
            <PredictionMarket
              title="Who will be Trump's Secretary of Defense?"
              options={[
                { name: "Pete Hegseth", percentage: "59%" },
                { name: "Mike Rogers", percentage: "9%" },
              ]}
              value="$2,905,143"
            />
            <PredictionMarket
              title="When will Bitcoin hit $100k?"
              options={[
                { name: "Before December", percentage: "44%" },
                { name: "Before January", percentage: "77%" },
              ]}
              value="$954,406"
            />
          </div>
        </main>
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

function PredictionMarket({
  title,
  options,
  value,
}: {
  title: string
  options: { name: string; percentage: string }[]
  value: string
}) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <h3 className="text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.map((option) => (
          <div key={option.name} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>{option.name}</span>
                <span className="font-medium">{option.percentage}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Yes
              </Button>
              <Button variant="outline" size="sm">
                No
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>{value}</span>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

