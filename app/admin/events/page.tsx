"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Define the Event type
interface Event {
  id: string
  title: string
  description: string
  category: string
  outcome1: string
  outcome2: string
  resolutionSource: string
  resolutionDateTime: string
  status: string
  createdAt: Date
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=pending')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Approve Events</h1>
        <Link href="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No events pending approval.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {event.category} • Created {new Date(event.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Outcome 1:</span>
                    <span>{event.outcome1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Outcome 2:</span>
                    <span>{event.outcome2}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Resolution Date:</span>
                    <span>{new Date(event.resolutionDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href={event.resolutionSource} 
                      target="_blank" 
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      View Resolution Source ↗
                    </Link>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(event.id)}
                >
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(event.id)}
                >
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

async function handleApprove(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to approve event')
    }

    // Refresh the page to show updated events
    window.location.reload()
  } catch (error) {
    console.error('Error approving event:', error)
    alert('Failed to approve event')
  }
}

async function handleReject(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to reject event')
    }

    // Refresh the page to show updated events
    window.location.reload()
  } catch (error) {
    console.error('Error rejecting event:', error)
    alert('Failed to reject event')
  }
} 