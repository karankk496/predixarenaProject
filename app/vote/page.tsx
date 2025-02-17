'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDistanceToNow, isPast } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  outcome1: string;
  outcome2: string;
  status: string;
  resolutionSource: string;
  resolutionDateTime: string;
  outcome1Votes: number;
  outcome2Votes: number;
  createdAt: string;
}

interface Vote {
  eventId: string;
  outcome: 'outcome1' | 'outcome2';
  userId: string;
}

const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  { value: "Creators", label: "Creators" },
  { value: "Sports", label: "Sports" },
  { value: "GlobalElections", label: "Global Elections" },
  { value: "Politics", label: "Politics" },
  { value: "Crypto", label: "Crypto" },
  { value: "Business", label: "Business" },
  { value: "Science", label: "Science" },
] as const;

export default function VotePage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchApprovedEvents();
    fetchUserVotes();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, categoryFilter]);

  const filterEvents = () => {
    let filtered = [...events];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(event => 
        event.category === categoryFilter
      );
    }

    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredEvents(filtered);
  };

  const fetchApprovedEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?status=approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved events');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const response = await fetch('/api/votes/user?userId=anonymous');
      if (response.ok) {
        const data = await response.json();
        const votesMap: Record<string, string> = {};
        data.votes.forEach((vote: Vote) => {
          votesMap[vote.eventId] = vote.outcome;
        });
        setUserVotes(votesMap);
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (eventId: string, outcome: 'outcome1' | 'outcome2') => {
    try {
      if (userVotes[eventId] === outcome) {
        return;
      }

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          outcome,
          userId: 'anonymous'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      setUserVotes(prev => ({
        ...prev,
        [eventId]: outcome
      }));

      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            const prevOutcome = userVotes[eventId];
            return {
              ...event,
              outcome1Votes: event.outcome1Votes + (
                outcome === 'outcome1' ? 1 : 0
              ) - (prevOutcome === 'outcome1' ? 1 : 0),
              outcome2Votes: event.outcome2Votes + (
                outcome === 'outcome2' ? 1 : 0
              ) - (prevOutcome === 'outcome2' ? 1 : 0)
            };
          }
          return event;
        })
      );

      toast({
        title: "Success",
        description: userVotes[eventId] 
          ? "Vote updated successfully" 
          : "Vote recorded successfully",
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to vote',
        variant: "destructive",
      });
    }
  };

  const isEventEnded = (resolutionDateTime: string) => {
    return isPast(new Date(resolutionDateTime));
  };

  const getTimeRemaining = (resolutionDateTime: string) => {
    return formatDistanceToNow(new Date(resolutionDateTime), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-600 text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Vote on Predictions</h1>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTERS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} approved predictions
          {categoryFilter !== "all" ? ` in ${categoryFilter}` : ""}
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No approved predictions found
              {categoryFilter !== "all" ? ` in ${categoryFilter}` : ""}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const hasVoted = userVotes[event.id];
            const eventEnded = isEventEnded(event.resolutionDateTime);
            
            return (
              <Card key={event.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline">{event.category}</Badge>
                      <p className="text-sm">
                        {eventEnded 
                          ? "Event has ended"
                          : `Ends ${getTimeRemaining(event.resolutionDateTime)}`
                        }
                      </p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                  <div className="space-y-2">
                    {!eventEnded && (
                      <div className="mt-4 space-y-2">
                        <Button 
                          onClick={() => handleVote(event.id, 'outcome1')} 
                          className={`w-full mb-2`}
                          variant={hasVoted === 'outcome1' ? "default" : "outline"}
                          disabled={eventEnded}
                        >
                          {hasVoted === 'outcome1' && '✓ '}
                          {event.outcome1} ({event.outcome1Votes})
                        </Button>
                        <Button 
                          onClick={() => handleVote(event.id, 'outcome2')} 
                          className={`w-full`}
                          variant={hasVoted === 'outcome2' ? "default" : "outline"}
                          disabled={eventEnded}
                        >
                          {hasVoted === 'outcome2' && '✓ '}
                          {event.outcome2} ({event.outcome2Votes})
                        </Button>
                      </div>
                    )}
                    {eventEnded && (
                      <div className="mt-4">
                        <p className="text-center text-muted-foreground">
                          Voting is closed
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 