'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must not exceed 2000 characters"),
  resolutionSource: z.string().url("Must be a valid URL").min(1, "Resolution source is required"),
  resolutionDate: z.string().min(1, "Resolution date and time is required"),
  outcomeOptions: z.string().min(1, "Outcome options are required"),
});

type EventFormData = z.infer<typeof eventSchema>;

export function CreateEvent() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    const outcomeOptionsArray = data.outcomeOptions.split(',').map(option => option.trim());
    const eventData = {
      ...data,
      outcomeOptions: outcomeOptionsArray,
    };

    console.log('Token retrieved:', localStorage.getItem('token'));

    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        toast.success('Event created successfully!');
        router.push('/events'); // Redirect to events page
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create event.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred while creating the event.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        placeholder="Event Title"
        {...register("title")}
        className={errors.title ? "border-red-500" : ""}
      />
      {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}

      <Textarea
        placeholder="Event Description"
        {...register("description")}
        className={errors.description ? "border-red-500" : ""}
      />
      {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}

      <Input
        placeholder="Resolution Source (URL)"
        {...register("resolutionSource")}
        className={errors.resolutionSource ? "border-red-500" : ""}
      />
      {errors.resolutionSource && <p className="text-sm text-red-600">{errors.resolutionSource.message}</p>}

      <Input
        type="datetime-local"
        {...register("resolutionDate")}
        className={errors.resolutionDate ? "border-red-500" : ""}
      />
      {errors.resolutionDate && <p className="text-sm text-red-600">{errors.resolutionDate.message}</p>}

      <Input
        placeholder="Outcome Options (comma separated)"
        {...register("outcomeOptions")}
        className={errors.outcomeOptions ? "border-red-500" : ""}
      />
      {errors.outcomeOptions && <p className="text-sm text-red-600">{errors.outcomeOptions.message}</p>}

      <Button type="submit">Create Event</Button>
    </form>
  );
} 