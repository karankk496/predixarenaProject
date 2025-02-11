import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// This would typically come from an API call
const events = [
  { id: 1, title: "2024 US Presidential Election", category: "Politics", status: "PENDING" },
  { id: 2, title: "World Cup 2026 Winner", category: "Sports", status: "APPROVED" },
  { id: 3, title: "Next iPhone Release Date", category: "Technology", status: "ACTIVE" },
  { id: 4, title: "Oscar Best Picture 2025", category: "Entertainment", status: "RESOLVED" },
]

export default function EventsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">All Events</h1>
        <Link href="/" className="text-sm text-primary hover:text-primary/90">
          ← Back to main page
        </Link>
      </div>
      <div className="mb-5">
        <Button asChild>
          <Link href="/events/create">Create New Event</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>{event.category}</TableCell>
              <TableCell>
                <Badge variant={event.status === "APPROVED" ? "success" : "secondary"}>{event.status}</Badge>
              </TableCell>
              <TableCell>
                <Button asChild variant="link">
                  <Link href={`/events/${event.id}`}>View</Link>
                </Button>
                {event.status === "PENDING" && (
                  <Button asChild variant="link">
                    <Link href={`/events/${event.id}/edit`}>Edit</Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

