"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// Define Event type
interface Event {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  outcome1: string
  outcome2: string
  resolutionSource: string
  resolutionDateTime: string
  status: string
}

export default function ApproveEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authorization required')
        return
      }

      const response = await fetch('/api/admin/approve-event', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      })
      
      if (response.status === 403) {
        toast.error('You do not have permission to view events')
        router.push('/')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      console.log('API Response:', data)

      if (data && Array.isArray(data)) {
        setEvents(data)
      } else if (data && data.success && Array.isArray(data.data)) {
        setEvents(data.data)
      } else {
        setEvents([])
        console.error('Unexpected data format:', data)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authorization required')
        return
      }

      console.log(`Updating event ${eventId} to ${status}`)

      const response = await fetch('/api/admin/approve-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify({ eventId, status })
      })

      if (response.status === 403) {
        toast.error('You do not have permission to update events')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(errorText || 'Failed to update event status')
      }

      await fetchEvents() // Refresh the list
      toast.success(`Event ${status} successfully`)
    } catch (error) {
      console.error('Status update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update event status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      approved: "bg-green-100 text-green-800",
    }
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-600 text-center">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Approve Events</h1>
        <Link href="/" className="text-sm text-primary hover:text-primary/90">
          ← Back to main page
        </Link>
      </div>
      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No events to manage</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge className={getStatusBadge(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <p className="text-sm">Category: {event.category}</p>
                    <div className="mt-2">
                      <p className="text-sm">Outcomes:</p>
                      <ul className="list-disc list-inside text-sm">
                        <li>{event.outcome1}</li>
                        <li>{event.outcome2}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {event.status !== 'approved' && (
                      <Button
                        onClick={() => handleStatusUpdate(event.id, 'approved')}
                        variant="default"
                      >
                        Approve
                      </Button>
                    )}
                    {event.status !== 'rejected' && (
                      <Button
                        onClick={() => handleStatusUpdate(event.id, 'rejected')}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
