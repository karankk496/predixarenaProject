"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Title contains invalid characters"),

  description: z.string().min(1, "Description is required").max(2000, "Description must not exceed 2000 characters"),

  category: z.string().min(1, "Category is required"),

  outcomes: z
    .array(
      z.object({
        label: z.string().min(1, "Outcome label is required"),
        probability: z
          .number()
          .min(0, "Probability must be between 0 and 100")
          .max(100, "Probability must be between 0 and 100")
          .optional(),
      }),
    )
    .min(2, "At least two outcomes are required")
    .refine((data) => {
      const total = data.reduce((sum, outcome) => sum + (outcome.probability || 0), 0)
      return total === 100 || total === 0
    }, "Probabilities must sum to 100%"),

  resolutionSource: z.string().url("Must be a valid URL").min(1, "Resolution source is required"),

  resolutionDateTime: z
    .string()
    .min(1, "Resolution date and time is required")
    .refine((date) => new Date(date) > new Date(), "Resolution date must be in the future"),
})

type EventCreationForm = z.infer<typeof eventSchema>

const CATEGORY_OPTIONS = [
  { label: "Politics", value: "politics" },
  { label: "Sports", value: "sports" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Technology", value: "technology" },
  { label: "Science", value: "science" },
  { label: "Economics", value: "economics" },
]

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [outcomeType, setOutcomeType] = useState("binary")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EventCreationForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      outcomes: [
        { label: "Yes", probability: 50 },
        { label: "No", probability: 50 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  })

  useEffect(() => {
    // Fetch event data and set form values
    const fetchEvent = async () => {
      try {
        // This would typically be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulating API delay
        const eventData = {
          title: "2024 US Presidential Election",
          description: "Predict the winner of the 2024 US Presidential Election",
          category: "politics",
          outcomes: [
            { label: "Democratic Party", probability: 48 },
            { label: "Republican Party", probability: 48 },
            { label: "Other", probability: 4 },
          ],
          resolutionSource: "https://www.example.com/election-results",
          resolutionDateTime: "2024-11-05T23:59:59",
        }
        reset(eventData)
        setOutcomeType(eventData.outcomes.length > 2 ? "multiple" : "binary")
      } catch (error) {
        console.error("Failed to fetch event data", error)
        setSubmitError("Failed to load event data")
      }
    }

    fetchEvent()
  }, [reset])

  const onSubmit = async (data: EventCreationForm) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Event updated and submitted for approval:", data)
      // Here you would typically send the data to your backend
      // and handle the response accordingly
      router.push("/events")
    } catch (error) {
      setSubmitError("An error occurred while updating the event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update the event details below. Once submitted, it will be sent for approval again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                <Input {...register("title")} className="mt-1" maxLength={100} />
                <p className="mt-1 text-sm text-gray-500">{watch("title")?.length || 0}/100 characters</p>
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Description</label>
                <Textarea {...register("description")} className="mt-1" rows={6} maxLength={2000} />
                <p className="mt-1 text-sm text-gray-500">{watch("description")?.length || 0}/2000 characters</p>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <Select onValueChange={(value) => register("category").onChange({ target: { value } })}>
                  <SelectTrigger>
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
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>
            </div>

            {/* Outcomes Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Outcome Options</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Define the possible outcomes for this event</p>
                <Select value={outcomeType} onValueChange={setOutcomeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binary">Binary (Yes/No)</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4">
                  <Input {...register(`outcomes.${index}.label` as const)} placeholder="Outcome label" />
                  <Input
                    {...register(`outcomes.${index}.probability` as const, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Initial probability"
                  />
                  <Button type="button" variant="ghost" onClick={() => remove(index)}>
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              ))}

              <Button type="button" onClick={() => append({ label: "", probability: 0 })}>
                Add Outcome
              </Button>

              {errors.outcomes && <p className="mt-1 text-sm text-red-600">{errors.outcomes.message}</p>}
            </div>

            {/* Resolution Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Resolution Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Resolution Source</label>
                <Input {...register("resolutionSource")} type="url" placeholder="https://" className="mt-1" />
                {errors.resolutionSource && (
                  <p className="mt-1 text-sm text-red-600">{errors.resolutionSource.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Resolution Date and Time (UTC)</label>
                <Input
                  {...register("resolutionDateTime")}
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  className="mt-1"
                />
                {errors.resolutionDateTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.resolutionDateTime.message}</p>
                )}
              </div>
            </div>

            {/* Review Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Review and Submit</h3>
              <p className="text-sm text-gray-500">
                Please review all the updated information above. Once you're satisfied, click the submit button to send
                your event for approval again.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Updated Event for Approval"
              )}
            </Button>

            {submitError && (
              <Alert variant="destructive">
                <AlertTitle>Submission Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/events" className="text-sm text-primary hover:text-primary/90">
            ← Back to events list
          </Link>
          <Link href="/" className="text-sm text-primary hover:text-primary/90">
          ← Back to main page
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

