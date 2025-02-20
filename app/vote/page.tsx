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
  user: {
    image?: string;
    displayName?: string;
  };
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view events",
          variant: "destructive",
        });
        setError('Please login to view events');
        return;
      }

      const response = await fetch('/api/events?status=approved', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          toast({
            title: "Session Expired",
            description: "Please login again",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch approved events');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Filter out events that have ended
        const activeEvents = data.events.filter((event: Event) => 
          !isPast(new Date(event.resolutionDateTime))
        );
        setEvents(activeEvents);
        setFilteredEvents(activeEvents);
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch events',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/votes?all=true', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) return
        throw new Error('Failed to fetch user votes')
      }

      const data = await response.json();
      if (data.success) {
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
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to vote')
        return
      }

      if (userVotes[eventId] === outcome) {
        return
      }

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          eventId,
          outcome
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login to vote')
          return
        }
        throw new Error(data.error || 'Failed to vote');
      }

      // Update local state
      setUserVotes(prev => ({
        ...prev,
        [eventId]: outcome
      }));

      // Update event vote counts
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            const prevOutcome = userVotes[eventId];
            const newEvent = { ...event };

            // If user hasn't voted before, just increment the new vote
            if (!prevOutcome) {
              newEvent[`${outcome}Votes`] = event[`${outcome}Votes`] + 1;
            } else {
              // If changing vote, decrement old vote and increment new vote
              newEvent[`${prevOutcome}Votes`] = event[`${prevOutcome}Votes`] - 1;
              newEvent[`${outcome}Votes`] = event[`${outcome}Votes`] + 1;
            }

            return newEvent;
          }
          return event;
        })
      );

      toast({
        title: "Success",
        description: data.message || "Vote recorded successfully",
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
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{event.category}</Badge>
                        <span className="text-sm">
                          {eventEnded 
                            ? "Event has ended"
                            : `Ends ${getTimeRemaining(event.resolutionDateTime)}`
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      {event.user?.image ? (
                        <img 
                          src={event.user.image} 
                          alt={event.user.displayName || ''} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {event.user?.displayName ? event.user.displayName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="text-sm font-medium">{event.user?.displayName || 'Anonymous'}</span>
                    </div>

                    {/* Rest of the content */}
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    {!eventEnded && (
                      <div className="mt-4 space-y-4">
                        {/* Title and Chance */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">{event.title}</h3>
                          <div className="text-gray-500">
                            {Math.round((event.outcome1Votes / (event.outcome1Votes + event.outcome2Votes || 1)) * 100)}% chance
                          </div>
                        </div>

                        {/* Options with Percentages */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{event.outcome1}</span>
                            <span className="text-sm text-gray-500">
                              {Math.round((event.outcome1Votes / (event.outcome1Votes + event.outcome2Votes || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{event.outcome2}</span>
                            <span className="text-sm text-gray-500">
                              {Math.round((event.outcome2Votes / (event.outcome1Votes + event.outcome2Votes || 1)) * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Voting Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleVote(event.id, 'outcome1')}
                            className={`flex-1 h-12 ${
                              userVotes[event.id] === 'outcome1'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-green-50 hover:bg-green-100 text-green-800'
                            }`}
                          >
                            {event.outcome1} ↑ {userVotes[event.id] === 'outcome1' && '✓'}
                          </Button>
                          <Button 
                            onClick={() => handleVote(event.id, 'outcome2')}
                            className={`flex-1 h-12 ${
                              userVotes[event.id] === 'outcome2'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-red-50 hover:bg-red-100 text-red-800'
                            }`}
                          >
                            {event.outcome2} ↓ {userVotes[event.id] === 'outcome2' && '✓'}
                          </Button>
                        </div>
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