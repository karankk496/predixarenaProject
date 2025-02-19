'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jwt from 'jsonwebtoken';

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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

  const renderEventActions = (event: Event) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET as string) as any;
      const isAdmin = decoded.role === 'ADMIN' || decoded.isSuperUser === true;
      
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

  const filterEvents = () => {
    let filtered = [...events];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(event => 
        event.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredEvents(filtered);
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
        <Link href="/events/create">
          <Button>Create New Event</Button>
        </Link>
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
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{event.category}</Badge>
                    <Badge className={getStatusBadgeColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                </CardDescription>
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
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {renderEventActions(event)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
