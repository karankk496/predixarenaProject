import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Add this to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPendingEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "pending"
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Found pending events:', events)
    return events
  } catch (error) {
    console.error('Error fetching pending events:', error)
    return []
  }
}

export default async function PendingEventsPage() {
  const events = await getPendingEvents()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Events</h1>
        <Link href="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No pending events found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Outcome 1:</span>
                    <span>{event.outcome1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Outcome 2:</span>
                    <span>{event.outcome2}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Resolution Date:</span>
                    <span>{new Date(event.resolutionDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href={event.resolutionSource} 
                      target="_blank" 
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      View Resolution Source
                    </Link>
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