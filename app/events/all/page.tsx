import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAllEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "approved"  // Only get approved events
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function AllEventsPage() {
  const events = await getAllEvents()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Approved Events</h1>
        <Link href="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No approved events found.</p>
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
                    <p className="text-sm text-muted-foreground">
                      Resolution Source: {event.resolutionSource}
                    </p>
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