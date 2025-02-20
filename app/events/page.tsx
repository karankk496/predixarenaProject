'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

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
  createdAt: string;
  user: {
    image?: string;
    displayName?: string;
  };
  outcome1Votes: number;
  outcome2Votes: number;
  votes: {
    userId: string;
    outcome: string;
  }[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All Events" },
  { value: "approved", label: "Approved Events" },
  { value: "rejected", label: "Rejected Events" },
  { value: "pending", label: "Pending Events" }
] as const;

const categories = [
  "All",
  "Creators",
  "Sports",
  "GlobalElections",
  "Mentions",
  "Politics",
  "Crypto",
  "PopCulture",
  "Business",
  "Science",
] as const;

const statuses = ["All", "approved", "rejected", "pending"] as const;

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [user, setUser] = useState<any | null>(null);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
      
      const response = await fetch('/api/events', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
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

  const handleVote = async (eventId: string, outcome: 'outcome1' | 'outcome2') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to vote')
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
          outcome,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      toast.success(data.message || 'Vote recorded successfully')
      await fetchAllEvents()
    } catch (error) {
      console.error('Vote error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to vote')
    }
  };

  const handleEventAction = async (eventId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authorization required');
        return;
      }

      const response = await fetch('/api/admin/approve-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify({ eventId, status: action === 'approve' ? 'approved' : 'rejected' }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Event ${action}ed successfully`,
        });
        fetchAllEvents(); // Refresh the events list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update event',
        variant: "destructive",
      });
    }
  };

  const checkVoteStatus = async (eventId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false

      const response = await fetch(`/api/votes?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check vote status')
      }

      return data.hasVoted
    } catch (error) {
      console.error('Vote status check error:', error)
      return false
    }
  };

  const getUserVote = (event: Event) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = JSON.parse(atob(token.split('.')[1])) as {
        role: string;
        userId: string;
      };
      const userVote = event.votes.find(vote => vote.userId === decoded.userId);
      return userVote?.outcome || null;
    } catch {
      return null;
    }
  };

  const renderEventActions = (event: Event) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = JSON.parse(atob(token.split('.')[1])) as {
        role: string;
        userId: string;
      };
      const isAdmin = decoded.role === 'ADMIN';
      
      if (isAdmin && event.status === 'pending') {
        return (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => handleEventAction(event.id, 'approve')}
              variant="outline"
              className="bg-green-100 hover:bg-green-200"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleEventAction(event.id, 'reject')}
              variant="outline"
              className="bg-red-100 hover:bg-red-200"
            >
              Reject
            </Button>
          </div>
        );
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, statusFilter]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const filterEvents = () => {
    let filtered = [...events];

    try {
      const token = localStorage.getItem('token');
      
      // If no token, only show approved events
      if (!token) {
        filtered = filtered.filter(event => event.status === 'approved');
        setFilteredEvents(filtered);
        return;
      }

      // Decode token without verification for client-side
      const decoded = JSON.parse(atob(token.split('.')[1])) as {
        role: string;
        userId: string;
      };
      
      const isAdmin = decoded.role === 'ADMIN';
      const userId = decoded.userId;

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter(event => 
          event.status.toLowerCase() === statusFilter.toLowerCase()
        );
      } else {
        // For non-admin users, show:
        // 1. All approved events
        // 2. Their own events (any status)
        if (!isAdmin) {
          filtered = filtered.filter(event => 
            event.status === 'approved' || event.userId === userId
          );
        }
      }

      // Sort by creation date (newest first)
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setFilteredEvents(filtered);
    } catch (error) {
      // If any error occurs, at least show approved events
      filtered = filtered.filter(event => event.status === 'approved');
      setFilteredEvents(filtered);
      console.error('Error filtering events:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
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
          <h1 className="text-2xl font-bold">All Events</h1>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/events/create">
            <Button>Create New Event</Button>
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/events/approve">
              <Button variant="outline">Approve Events</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} {statusFilter !== "all" ? statusFilter : ""} events
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No {statusFilter !== "all" ? statusFilter : ""} events found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {event.user.image ? (
                      <img 
                        src={event.user.image} 
                        alt={event.user.displayName || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {(event.user.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{event.user.displayName}</span>
                  </div>
                  <Badge 
                    className={
                      event.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : event.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-xs">
                    {event.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Ends {getTimeRemaining(event.resolutionDateTime)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  {event.status === 'approved' && (
                    <>
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

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleVote(event.id, 'outcome1')}
                          className={`w-full h-12 ${
                            getUserVote(event) === 'outcome1'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-green-50 hover:bg-green-100 text-green-800'
                          }`}
                          disabled={false}
                        >
                          {event.outcome1} ↑ {getUserVote(event) === 'outcome1' && '✓'}
                        </Button>
                        <Button 
                          onClick={() => handleVote(event.id, 'outcome2')}
                          className={`w-full h-12 ${
                            getUserVote(event) === 'outcome2'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-50 hover:bg-red-100 text-red-800'
                          }`}
                          disabled={false}
                        >
                          {event.outcome2} ↓ {getUserVote(event) === 'outcome2' && '✓'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{event.outcome1Votes + event.outcome2Votes} votes</span>
                        <span className="bg-orange-100 rounded-full px-3 py-1 text-orange-700">
                          {Math.round((event.outcome1Votes / (event.outcome1Votes + event.outcome2Votes || 1)) * 100)}% chance
                        </span>
                      </div>
                    </>
                  )}
                  {renderEventActions(event)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}
