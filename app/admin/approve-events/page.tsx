"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
  const [events, setEvents] = useState<Event[]>([])
  const [comments, setComments] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pending-events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
        console.error('Invalid data format received:', data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Updating event ${eventId} to ${status}`);

      const response = await fetch('/api/admin/event-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          eventId,
          status,
        }),
      });

      const result = await response.json();
      console.log('Status update response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event status');
      }

      toast.success(`Event ${status} successfully`);
      
      // Refresh the events list
      await fetchEvents();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event status');
    }
  }


  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      REJECTED: "bg-red-100 text-red-800",
      APPROVED: "bg-green-100 text-green-800",
    }
    return styles[status.toUpperCase() as keyof typeof styles] || "bg-gray-100 text-gray-800"
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
      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-5">
          <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No events found</p>
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
                      {event.status !== 'APPROVED' && (
                      <Button
                        onClick={() => handleStatusUpdate(event.id, 'approved')}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      )}
                      {event.status !== 'REJECTED' && (
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

