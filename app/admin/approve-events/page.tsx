"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// This would typically come from an API call
const pendingEvents = [
  {
    id: 1,
    title: "2024 US Presidential Election",
    description: "Predict the winner of the 2024 US Presidential Election",
    category: "Politics",
    createdAt: "2023-06-01",
    outcomes: [
      { label: "Democratic Party", probability: 48 },
      { label: "Republican Party", probability: 48 },
      { label: "Other", probability: 4 },
    ],
    resolutionSource: "https://www.example.com/election-results",
    resolutionDateTime: "2024-11-05T23:59:59",
  },
  {
    id: 2,
    title: "Next Major Earthquake Prediction",
    description: "Predict the location and magnitude of the next major earthquake",
    category: "Science",
    createdAt: "2023-06-02",
    outcomes: [
      { label: "Magnitude 7.0 or higher", probability: 30 },
      { label: "Magnitude 6.0 to 6.9", probability: 50 },
      { label: "Magnitude 5.9 or lower", probability: 20 },
    ],
    resolutionSource: "https://www.example.com/earthquake-data",
    resolutionDateTime: "2023-12-31T23:59:59",
  },
  {
    id: 3,
    title: "Bitcoin Price at End of 2023",
    description: "Predict the price range of Bitcoin at the end of 2023",
    category: "Economics",
    createdAt: "2023-06-03",
    outcomes: [
      { label: "Above $50,000", probability: 25 },
      { label: "$30,000 - $50,000", probability: 50 },
      { label: "Below $30,000", probability: 25 },
    ],
    resolutionSource: "https://www.example.com/crypto-prices",
    resolutionDateTime: "2023-12-31T23:59:59",
  },
]

export default function ApproveEventsPage() {
  const [events, setEvents] = useState(pendingEvents)
  const [comments, setComments] = useState<{ [key: number]: string }>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleApprove = async (id: number) => {
    // This would typically be an API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulating API delay
      setEvents(events.filter((event) => event.id !== id))
      setMessage({ type: "success", text: "Event approved successfully" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to approve event" })
    }
  }

  const handleReject = async (id: number) => {
    // This would typically be an API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulating API delay
      setEvents(events.filter((event) => event.id !== id))
      setMessage({ type: "success", text: "Event rejected successfully" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to reject event" })
    }
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
      {events.map((event) => (
        <Card key={event.id} className="mb-6">
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>Created on: {event.createdAt}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="event-details">
                <AccordionTrigger>View Event Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Description</h4>
                      <p>{event.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Category</h4>
                      <p>{event.category}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Outcomes</h4>
                      <ul className="list-disc pl-5">
                        {event.outcomes.map((outcome, index) => (
                          <li key={index}>
                            {outcome.label}: {outcome.probability}%
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Resolution Source</h4>
                      <a
                        href={event.resolutionSource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {event.resolutionSource}
                      </a>
                    </div>
                    <div>
                      <h4 className="font-semibold">Resolution Date and Time</h4>
                      <p>{new Date(event.resolutionDateTime).toLocaleString()}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-4">
              <label htmlFor={`comment-${event.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Approval Comments
              </label>
              <Textarea
                id={`comment-${event.id}`}
                value={comments[event.id] || ""}
                onChange={(e) => setComments({ ...comments, [event.id]: e.target.value })}
                placeholder="Add comments..."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button onClick={() => handleReject(event.id)} variant="destructive">
              Reject
            </Button>
            <Button onClick={() => handleApprove(event.id)} variant="default">
              Approve
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

