"use client"

// React and Next.js imports
import { useState } from "react"



// Form and validation imports
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// UI Component imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import toast, { Toaster } from 'react-hot-toast';

// Icons
import { Loader2 } from "lucide-react"

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must not exceed 2000 characters"),
  category: z.string().min(1, "Category is required"),
  outcome1: z.string().min(1, "Outcome 1 is required"),
  outcome2: z.string().min(1, "Outcome 2 is required"),
  resolutionSource: z.string().min(1, "Resolution source is required").max(500, "Resolution source must not exceed 500 characters"),
  resolutionDateTime: z.string().min(1, "Resolution date and time is required"),
})

type EventFormData = z.infer<typeof eventSchema>

// Define categories as a constant
export const CATEGORIES = [
  "Creators",
  "Sports", 
  "GlobalElections", 
  "Mentions", 
  "Politics", 
  "Crypto", 
  "PopCulture", 
  "Business", 
  "Science"
] as const;

export type Category = typeof CATEGORIES[number];

// Add Category Options Configuration
const CATEGORY_OPTIONS = [
  { value: 'Creators', label: 'Creators' },
  { value: 'Sports', label: 'Sports' },
  { value: 'GlobalElections', label: 'Global Elections' },
  { value: 'Mentions', label: 'Mentions' },
  { value: 'Politics', label: 'Politics' },
  { value: 'Crypto', label: 'Crypto' },
  { value: 'PopCulture', label: 'Pop Culture' },
  { value: 'Business', label: 'Business' },
  { value: 'Science', label: 'Science' }
];

export default function CreateEventPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Update the event schema to use the new Category type
  const eventSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
    description: z.string().min(1, "Description is required").max(2000, "Description must not exceed 2000 characters"),
    category: z.enum(CATEGORIES, { 
      errorMap: () => ({ message: "Category is required" }) 
    }),
    outcome1: z.string().min(1, "Outcome 1 is required"),
    outcome2: z.string().min(1, "Outcome 2 is required"),
    resolutionSource: z.string().min(1, "Resolution source is required").max(500, "Resolution source must not exceed 500 characters"),
    resolutionDateTime: z.string().min(1, "Resolution date and time is required"),
  })

  type EventFormData = z.infer<typeof eventSchema>
  const [isSubmitting, setIsSubmitting] = useState(false)


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      const formDataWithProperCase = {
        ...data,
        category: data.category.toUpperCase()
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithProperCase),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Event created successfully!', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            padding: '16px',
            borderRadius: '8px',
          },
        });
        
        // Reset form and category
        reset();
        setSelectedCategory("");


      } else {
        // Handle duplicate event error specifically
        if (response.status === 409) {
          toast.error(result.error, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #F87171',
            },
          });
        } else {
          toast.error(result.error || 'Failed to create event', {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '16px',
              borderRadius: '8px',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An unexpected error occurred. Please try again.', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsSubmitting(false);
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
              {errors.title && (
              <div className="text-red-600 text-sm mt-1 font-medium">
                {errors.title.message}
              </div>
              )}
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
                <Select 
                  value={selectedCategory}
                  onValueChange={(value: Category) => {
                  setSelectedCategory(value);
                  setValue("category", value);
                  }}
                >
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
          <Button 
          variant="link" 
          className="text-sm text-primary hover:text-primary/90"
            onClick={(e) => {
            e.preventDefault();
            reset();
            setSelectedCategory("");
            }}
          >
          ← Back to events list
          </Button>
          <Button 
          variant="link" 
          className="text-sm text-primary hover:text-primary/90"
            onClick={(e) => {
            e.preventDefault();
            reset();
            setSelectedCategory("");
            }}
          >
          Back to main page
          </Button>
        </CardFooter>
        </Card>
        <Toaster />
      </div>
      )
    }

// TODO: Add authentication check for event creation
// export async function getServerSideProps(context) {
//   const session = await getServerSession(context.req, context.res, authOptions);
//   if (!session) {
//     return {
//       redirect: {
//         destination: '/login',
//         permanent: false,
//       },
//     };
//   }
//   return { props: {} };
// }
