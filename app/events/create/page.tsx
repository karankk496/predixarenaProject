"use client"

// React and Next.js imports
import { useState } from "react"
import { useRouter } from "next/navigation"

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

// Define categories array
const CATEGORIES = [
  'Creators',
  'Sports',
  'GlobalElections',
  'Mentions',
  'Politics',
  'Crypto',
  'PopCulture',
  'Business',
  'Science',
  'Technology',    // New category
  'Entertainment', // New category
  'Gaming',        // New category
  'Music',         // New category
  'Movies',        // New category
  'TV Shows',      // New category
  'Anime',         // New category
  'Education'      // New category
] as const;

type Category = typeof CATEGORIES[number];

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  outcome1?: string;
  outcome2?: string;
  resolutionSource?: string;
  resolutionDateTime?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as Category,
    outcome1: '',
    outcome2: '',
    resolutionSource: '',
    resolutionDateTime: ''
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.outcome1.trim()) {
      newErrors.outcome1 = 'Outcome 1 is required';
    }

    if (!formData.outcome2.trim()) {
      newErrors.outcome2 = 'Outcome 2 is required';
    }

    if (!formData.resolutionSource.trim()) {
      newErrors.resolutionSource = 'Resolution source is required';
    }

    if (!formData.resolutionDateTime) {
      newErrors.resolutionDateTime = 'Resolution date and time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to create an event');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add auth token
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login again');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          toast.error('Only admin users can create events');
          return;
        }
        throw new Error(data.error || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      setFormData({  // Reset form
        title: '',
        description: '',
        category: '' as Category,
        outcome1: '',
        outcome2: '',
        resolutionSource: '',
        resolutionDateTime: ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: string
  ) => {
    // Clear error when field is being edited
    setErrors(prev => ({ ...prev, [field]: undefined }));

    if (typeof e === 'string') {
      // Handle Select value
      setFormData(prev => ({ ...prev, [field]: e }));
    } else {
      // Handle Input and Textarea values
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the details to create a new prediction event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Event Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={e => handleChange(e, 'title')}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.title}
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
                name="description"
                value={formData.description}
                onChange={e => handleChange(e, 'description')}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.description}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange(value, 'category')}
              >
                <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.category}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="outcome1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Outcome 1
              </label>
              <Input
                id="outcome1"
                name="outcome1"
                value={formData.outcome1}
                onChange={e => handleChange(e, 'outcome1')}
                className={errors.outcome1 ? "border-red-500" : ""}
              />
              {errors.outcome1 && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.outcome1}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="outcome2"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Outcome 2
              </label>
              <Input
                id="outcome2"
                name="outcome2"
                value={formData.outcome2}
                onChange={e => handleChange(e, 'outcome2')}
                className={errors.outcome2 ? "border-red-500" : ""}
              />
              {errors.outcome2 && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.outcome2}
                </div>
              )}
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
                name="resolutionSource"
                value={formData.resolutionSource}
                onChange={e => handleChange(e, 'resolutionSource')}
                className={errors.resolutionSource ? "border-red-500" : ""}
              />
              {errors.resolutionSource && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.resolutionSource}
                </div>
              )}
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
                name="resolutionDateTime"
                type="datetime-local"
                value={formData.resolutionDateTime}
                onChange={e => handleChange(e, 'resolutionDateTime')}
                className={errors.resolutionDateTime ? "border-red-500" : ""}
              />
              {errors.resolutionDateTime && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {errors.resolutionDateTime}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
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
              router.push('/events');
            }}
          >
            ← Back to events list
          </Button>
          <Button 
            variant="link" 
            className="text-sm text-primary hover:text-primary/90"
            onClick={(e) => {
              e.preventDefault();
              router.push('/');
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
