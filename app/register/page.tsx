"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Loader2, CheckIcon, XIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Disclosure } from "@headlessui/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

const registrationSchema = z
  .object({
    email: z.string().email("Invalid email address").max(254, "Email must not exceed 254 characters"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),
    confirmPassword: z.string(),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    displayName: z.string().min(3).max(30).optional(),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    privacyAccepted: z.boolean()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type RegistrationFormData = z.infer<typeof registrationSchema>

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  })

  const password = watch("password")

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const formData = {
        ...data,
        privacyAccepted: Boolean(data.privacyAccepted)
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          displayName: formData.displayName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined
        }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || 'An error occurred')
      }

      // Redirect to login page after successful registration
      router.push('/login')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkEmailAvailability = async (email: string) => {
    setIsValidating(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsValid(true) // Assume email is available for this example
    } catch (error) {
      setIsValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const updatePasswordStrength = (password: string) => {
    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      setPasswordStrength("strong")
    } else if (password.length >= 8) {
      setPasswordStrength("medium")
    } else {
      setPasswordStrength("weak")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Fill in the required information to get started. Additional details can be added later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" suppressHydrationWarning data-testid="registration-form">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Information</h3>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={cn(errors.email && "border-red-500 focus:ring-red-500")}
                      {...register("email", {
                        onChange: (e) => checkEmailAvailability(e.target.value),
                      })}
                      data-testid="email-input"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {isValidating && <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />}
                      {isValid && <CheckIcon className="h-5 w-5 text-green-500" />}
                      {!isValid && touchedFields.email && <XIcon className="h-5 w-5 text-red-500" />}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" id="email-error">
                      {errors.email.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">We'll never share your email with anyone else.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className={cn(errors.password && "border-red-500 focus:ring-red-500")}
                    {...register("password", {
                      onChange: (e) => updatePasswordStrength(e.target.value),
                    })}
                    data-testid="password-input"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600" id="password-error">
                      {errors.password.message}
                    </p>
                  )}
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          passwordStrength === "weak" && "w-1/4 bg-red-500",
                          passwordStrength === "medium" && "w-2/4 bg-yellow-500",
                          passwordStrength === "strong" && "w-full bg-green-500",
                        )}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {passwordStrength === "weak" && "Weak password"}
                      {passwordStrength === "medium" && "Medium strength password"}
                      {passwordStrength === "strong" && "Strong password"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={cn(errors.confirmPassword && "border-red-500 focus:ring-red-500")}
                    {...register("confirmPassword")}
                    data-testid="confirm-password-input"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600" id="confirm-password-error">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Additional Information (Optional)</span>
                      <ChevronRightIcon className={cn("h-5 w-5 text-gray-500", open && "transform rotate-90")} />
                    </Disclosure.Button>

                    <Disclosure.Panel className="px-4 pt-4 pb-2 space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <Input
                            id="firstName"
                            type="text"
                            {...register("firstName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <Input
                            id="lastName"
                            type="text"
                            {...register("lastName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                            Display Name
                          </label>
                          <Input
                            id="displayName"
                            type="text"
                            {...register("displayName")}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            {...register("phoneNumber")}
                            suppressHydrationWarning
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                            Date of Birth
                          </label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            {...register("dateOfBirth")}
                            suppressHydrationWarning
                          />
                        </div>
                        <Select 
                          onValueChange={(value) => {
                            register("gender").onChange({ 
                              target: { value, name: "gender" } 
                            })
                          }}
                          value={watch("gender") || ""}
                          suppressHydrationWarning
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="privacyAccepted" 
                  checked={watch('privacyAccepted')}
                  onCheckedChange={(checked) => {
                    register('privacyAccepted').onChange({
                      target: { value: checked, name: 'privacyAccepted' }
                    })
                  }}
                />
                <label
                  htmlFor="privacyAccepted"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/90">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/90">
                    Terms of Service
                  </Link>
                </label>
              </div>
              {errors.privacyAccepted && (
                <p className="mt-1 text-sm text-red-600" id="privacy-error">
                  {errors.privacyAccepted.message}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                suppressHydrationWarning
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {formError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                Sign in
              </Link>
            </p>
            <Link href="/" className="text-sm text-primary hover:text-primary/90">
              ← Back to main page
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

