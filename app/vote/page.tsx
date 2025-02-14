"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Event {
  id: string
  title: string
  description: string
  category: string
  outcome1: string
  outcome2: string
  outcome1Votes: number
  outcome2Votes: number
  resolutionSource: string
  resolutionDateTime: string
  status: string
  hasVoted?: boolean
  votedFor?: 'outcome1' | 'outcome2'
}

export default function VotePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchVotableEvents()
  }, [])

  const fetchVotableEvents = async () => {
    try {
      const response = await fetch('/api/events?status=approved')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      
      // Check cookies for each event to set initial vote state
      const events = await Promise.all(data.map(async (event: Event) => {
        const cookieResponse = await fetch(`/api/events/${event.id}/vote-status`)
        if (cookieResponse.ok) {
          const { votedFor } = await cookieResponse.json()
          return { ...event, votedFor }
        }
        return event
      }))
      
      setEvents(events)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (eventId: string, outcome: 'outcome1' | 'outcome2') => {
    try {
      console.log('Attempting to vote:', { eventId, outcome })

      const event = events.find(e => e.id === eventId)
      const previousVote = event?.votedFor

      const response = await fetch(`/api/events/${eventId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          outcome,
          previousVote // Send the previous vote to the API
        }),
      })

      const data = await response.json()
      console.log('Vote response:', { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit vote')
      }

      // Update local state
      setEvents(events.map(event => {
        if (event.id === eventId) {
          // If changing vote, decrement previous vote count
          const newEvent = {
            ...event,
            votedFor: outcome,
            [`${outcome}Votes`]: (event[`${outcome}Votes`] || 0) + 1
          }
          
          if (previousVote) {
            newEvent[`${previousVote}Votes`] = Math.max(0, (event[`${previousVote}Votes`] || 0) - 1)
          }
          
          return newEvent
        }
        return event
      }))

      toast({
        title: previousVote ? "Vote Changed" : "Vote Recorded",
        description: previousVote ? "Your vote has been successfully changed." : "Your vote has been successfully recorded.",
      })
    } catch (error) {
      console.error('Error voting:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote",
      })
    }
  }

  const getTimeRemaining = (resolutionDateTime: string) => {
    const now = new Date().getTime()
    const resolution = new Date(resolutionDateTime).getTime()
    const timeLeft = resolution - now

    if (timeLeft <= 0) return "Event ended"

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    return `${days}d ${hours}h ${minutes}m`
  }

  const calculateVotePercentage = (votes: number | undefined, totalVotes: number) => {
    if (!votes || totalVotes === 0) return 0
    return (votes / totalVotes) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
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
        <h1 className="text-2xl font-bold">Vote on Predictions</h1>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No events available for voting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const totalVotes = (event.outcome1Votes || 0) + (event.outcome2Votes || 0)
            const outcome1Percentage = calculateVotePercentage(event.outcome1Votes, totalVotes)
            const outcome2Percentage = calculateVotePercentage(event.outcome2Votes, totalVotes)

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{event.outcome1}</span>
                          <span>{outcome1Percentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={outcome1Percentage} 
                          className={`h-2 ${event.votedFor === 'outcome1' ? 'bg-primary' : ''}`}
                        />
                        <Button 
                          className="w-full mt-1 relative"
                          variant={event.votedFor === 'outcome1' ? 'default' : 'outline'}
                          onClick={() => handleVote(event.id, 'outcome1')}
                          disabled={event.votedFor === 'outcome1'}
                        >
                          <span className="flex items-center gap-2">
                            {event.votedFor === 'outcome1' && <CheckIcon className="h-4 w-4" />}
                            {event.votedFor === 'outcome1' ? 'Voted' : event.votedFor ? 'Change Vote' : 'Vote'} ({event.outcome1Votes || 0})
                          </span>
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{event.outcome2}</span>
                          <span>{outcome2Percentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={outcome2Percentage} 
                          className={`h-2 ${event.votedFor === 'outcome2' ? 'bg-primary' : ''}`}
                        />
                        <Button 
                          className="w-full mt-1 relative"
                          variant={event.votedFor === 'outcome2' ? 'default' : 'outline'}
                          onClick={() => handleVote(event.id, 'outcome2')}
                          disabled={event.votedFor === 'outcome2'}
                        >
                          <span className="flex items-center gap-2">
                            {event.votedFor === 'outcome2' && <CheckIcon className="h-4 w-4" />}
                            {event.votedFor === 'outcome2' ? 'Voted' : event.votedFor ? 'Change Vote' : 'Vote'} ({event.outcome2Votes || 0})
                          </span>
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Time Remaining: {getTimeRemaining(event.resolutionDateTime)}</p>
                      <p className="mt-1">Total Votes: {totalVotes}</p>
                      <p className="mt-1">Source: {event.resolutionSource}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

