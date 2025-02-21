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
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view events');
        return;
      }

      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Fetched events:', data.events.length);
        setEvents(data.events);
        setFilteredEvents(data.events);
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      toast.error(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

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

  useEffect(() => {
    filterEvents();
  }, [events, statusFilter]);

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
    <div className="container mx-auto p-4">
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
          {localStorage.getItem('token') ? (
            <Link href="/events/create">
              <Button>Create New Event</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={() => toast.error('Please login to create events')}>
              Create New Event
            </Button>
          )}
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
                <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Outcomes:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{event.outcome1}</Badge>
                      <span className="text-sm text-gray-500">vs</span>
                      <Badge variant="secondary">{event.outcome2}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Resolution Source: {event.resolutionSource}</span>
                  </div>
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