"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must not exceed 2000 characters"),
  category: z.string().min(1, "Category is required"),
  outcome1: z.string().min(1, "Outcome 1 is required"),
  outcome2: z.string().min(1, "Outcome 2 is required"),
  resolutionSource: z.string().url("Must be a valid URL").min(1, "Resolution source is required"),
  resolutionDateTime: z.string().min(1, "Resolution date and time is required"),
})

type EventFormData = z.infer<typeof eventSchema>

const CATEGORY_OPTIONS = [
  { label: "Politics", value: "politics" },
  { label: "Sports", value: "sports" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Technology", value: "technology" },
  { label: "Science", value: "science" },
  { label: "Economics", value: "economics" },
]

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      // Here you would typically send the data to your backend
      console.log("Event submitted:", data)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push("/events")
    } catch (error) {
      console.error("Error submitting event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the details to create a new prediction event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Event Title
              </label>
              <Input id="title" {...register("title")} className={errors.title ? "border-red-500" : ""} />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description
              </label>
              <Textarea
                id="description"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Category
              </label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="outcome1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Outcome 1
              </label>
              <Input id="outcome1" {...register("outcome1")} className={errors.outcome1 ? "border-red-500" : ""} />
              {errors.outcome1 && <p className="text-sm text-red-600">{errors.outcome1.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="outcome2"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Outcome 2
              </label>
              <Input id="outcome2" {...register("outcome2")} className={errors.outcome2 ? "border-red-500" : ""} />
              {errors.outcome2 && <p className="text-sm text-red-600">{errors.outcome2.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resolutionSource"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Resolution Source
              </label>
              <Input
                id="resolutionSource"
                type="url"
                {...register("resolutionSource")}
                className={errors.resolutionSource ? "border-red-500" : ""}
              />
              {errors.resolutionSource && <p className="text-sm text-red-600">{errors.resolutionSource.message}</p>}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resolutionDateTime"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Resolution Date and Time
              </label>
              <Input
                id="resolutionDateTime"
                type="datetime-local"
                {...register("resolutionDateTime")}
                className={errors.resolutionDateTime ? "border-red-500" : ""}
              />
              {errors.resolutionDateTime && <p className="text-sm text-red-600">{errors.resolutionDateTime.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/events" className="text-sm text-primary hover:text-primary/90">
            ← Back to events list
          </Link>
          <Link href="/" className="text-sm text-primary hover:text-primary/90">
            Back to main page
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

