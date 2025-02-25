'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
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
  outcomes: string[];
  outcomeVotes: number[];
  status: string;
  resolutionSource: string;
  resolutionDateTime: string;
  createdAt: string;
  user: {
    image?: string;
    displayName?: string;
  };
}

interface Vote {
  eventId: string;
  outcomeIndex: number;
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
          votesMap[vote.eventId] = vote.outcomeIndex.toString();
        });
        setUserVotes(votesMap);
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (eventId: string, outcomeIndex: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Error",
          description: 'Please login to vote',
          variant: "destructive",
        });
        return;
      }

      if (userVotes[eventId] === outcomeIndex.toString()) {
        return;
      }

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          eventId,
          outcomeIndex
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Error",
            description: 'Please login to vote',
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error || 'Failed to vote');
      }

      // Update local state
      setUserVotes(prev => ({
        ...prev,
        [eventId]: outcomeIndex.toString()
      }));

      // Update event vote counts
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            const prevVote = userVotes[eventId];
            const newEvent = { ...event };
            const newVotes = [...event.outcomeVotes];

            // If user hasn't voted before, just increment the new vote
            if (!prevVote) {
              newVotes[outcomeIndex]++;
            } else {
              // If changing vote, decrement previous vote and increment new vote
              const prevIndex = parseInt(prevVote);
              newVotes[prevIndex]--;
              newVotes[outcomeIndex]++;
            }

            return {
              ...newEvent,
              outcomeVotes: newVotes
            };
          }
          return event;
        })
      );

      toast({
        title: "Success",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      console.error('Error voting:', error);
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
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
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
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
            const totalVotes = event.outcomeVotes.reduce((sum, votes) => sum + votes, 0);
            
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

                    {!eventEnded && (
                      <div className="mt-4 space-y-4">
                        {/* Options with Percentages */}
                        <div className="flex flex-col gap-2">
                          {event.outcomes.map((outcome, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{outcome}</span>
                              <span className="text-sm text-gray-500">
                                {Math.round((event.outcomeVotes[index] / (totalVotes || 1)) * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Voting Buttons */}
                        <div className="flex gap-2">
                          {localStorage.getItem('token') ? (
                            <div className="flex flex-wrap gap-2 w-full">
                              {event.outcomes.map((outcome, index) => (
                                <Button 
                                  key={index}
                                  onClick={() => handleVote(event.id, index)}
                                  className={`flex-1 h-12 ${
                                    userVotes[event.id] === index.toString()
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : 'bg-green-50 hover:bg-green-100 text-green-800'
                                  }`}
                                  disabled={loading}
                                >
                                  {outcome}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full text-center p-4 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-600">Please login to vote on predictions</p>
                            </div>
                          )}
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

                    <div className="mt-4 text-sm text-gray-500">
                      <p>Resolution Source: {event.resolutionSource}</p>
                      <p>Total Votes: {totalVotes}</p>
                    </div>
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