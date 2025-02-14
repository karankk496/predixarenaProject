'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export default function VotePredictionPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVotableEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?status=approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const result = await response.json();
      console.log('Raw API Response:', result); // Debug log

      if (result && result.events && Array.isArray(result.events)) {
        setEvents(result.events);
      } else {
        console.error('Invalid data structure:', result);
        setEvents([]);
      }

    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotableEvents();
  }, []);

  const handleVote = async (eventId: string, outcome: 'outcome1' | 'outcome2') => {
    try {
      const response = await fetch(`/api/events/${eventId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      toast.success('Vote submitted successfully!');
      fetchVotableEvents(); // Refresh the list after voting
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
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
      <Card>
        <CardHeader>
          <CardTitle>Vote on Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No approved events available for voting
            </p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant="outline">
                          {event.category.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center">
                          <Button 
                            className="w-full mb-2" 
                            variant="outline"
                            onClick={() => handleVote(event.id, 'outcome1')}
                          >
                            {event.outcome1}
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Votes: {event.outcome1Votes || 0}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Button 
                            className="w-full mb-2" 
                            variant="outline"
                            onClick={() => handleVote(event.id, 'outcome2')}
                          >
                            {event.outcome2}
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Votes: {event.outcome2Votes || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Resolution Source: {event.resolutionSource}</p>
                        <p>Resolution Date: {new Date(event.resolutionDateTime).toLocaleDateString()}</p>
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