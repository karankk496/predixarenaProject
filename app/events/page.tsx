'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const fetchVotableEvents = async (): Promise<Event[]> => {
    try {
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array response, got:', typeof data, data);
        return [];
      }
      
      // Type-safe validation of events
      const validEvents = data.filter((event: any): event is Event => 
        typeof event.id === 'string' &&
        typeof event.title === 'string' &&
        typeof event.description === 'string' &&
        typeof event.category === 'string' &&
        typeof event.outcome1 === 'string' &&
        typeof event.outcome2 === 'string' &&
        typeof event.status === 'string' &&
        typeof event.resolutionSource === 'string' &&
        typeof event.resolutionDateTime === 'string' &&
        typeof event.outcome1Votes === 'number' &&
        typeof event.outcome2Votes === 'number'
      );

      if (validEvents.length === 0) {
        console.warn('No valid events found in the response');
      }

      return validEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const events = await fetchVotableEvents();

      if (events.length === 0) {
        setError('No valid events could be loaded');
      }

      setEvents(events);
    } catch (error) {
      console.error('Fetch events error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const filteredEvents = events.filter(event => {
    const categoryMatch = selectedCategory === "All" || event.category === selectedCategory;
    const statusMatch = selectedStatus === "All" || event.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  useEffect(() => {
    console.log('Filtered events:', {
      total: events.length,
      filtered: filteredEvents.length,
      category: selectedCategory,
      status: selectedStatus
    });
  }, [events, filteredEvents, selectedCategory, selectedStatus]);

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
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="w-48">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "All" 
                        ? "All Categories" 
                        : category.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" 
                        ? "All Statuses" 
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <p className="text-center text-muted-foreground">No events found</p>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusBadgeColor(event.status)}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">
                            {event.category.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm">Outcomes:</p>
                        <ul className="list-disc list-inside text-sm">
                          <li>{event.outcome1}</li>
                          <li>{event.outcome2}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

