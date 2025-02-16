"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { MoreHorizontal, Search,Loader2, Settings, User, Globe, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { UserProfile } from "./components/UserProfile"
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
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, isPast } from 'date-fns'

interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  role: string;
  isSuperUser: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  outcome1: string;
  outcome2: string;
  status: string;
  resolutionDateTime: string;
  outcome1Votes: number;
  outcome2Votes: number;
  createdAt: string;
}

export default function Page() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Fetching events...'); // Debug log
        const response = await fetch('/api/events?status=approved');
        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        
        if (data.success) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                    <span>{userData.displayName || `${userData.firstName} ${userData.lastName}`}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
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

      {/* Add profile modal */}
      {userData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">Profile</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setUserData(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <UserProfile onClose={() => setUserData(null)} />
            </div>
          </div>
        </div>
      )}

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
            {/* TODO: Authentication Required - Currently disabled for development
                These actions should require authentication:
                - Creating events: Requires logged-in user
                - Approving events: Requires isSuperUser=true
                - Voting: Requires logged-in user
            */}
            {/* {userData ? (
              <>
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
                {userData.isSuperUser && (
                  <Button asChild variant="outline">
                    <Link href="/admin/approve-events">Approve Events</Link>
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                Please <Link href="/login" className="text-primary hover:underline">sign in</Link> to create or manage events
              </div>
            )} */}

            {/* SECURITY WARNING: These buttons are currently accessible without authentication */}
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
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No approved predictions found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline">{event.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{event.outcome1}</span>
                          <Badge variant="secondary">{event.outcome1Votes} votes</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{event.outcome2}</span>
                          <Badge variant="secondary">{event.outcome2Votes} votes</Badge>
                        </div>
                        <Link href="/vote" className="block mt-4">
                          <Button className="w-full" variant="outline">
                            Vote Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
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

