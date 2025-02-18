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
import { FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { toast } from "sonner";
import { Label } from "@/components/ui/label"
import { Snackbar } from "@mui/material"

const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(5, "Password must be at least 5 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy and Terms of Service"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

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
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      privacyAccepted: false
    }
  })

  const password = watch("password")

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection')
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP error! status: ${response.status}`
        }))
        throw new Error(errorData.error || 'Registration failed')
      }

      const result = await response.json()

      setSnackbarMessage(`Account created successfully! Please login to continue.`)
      setOpenSnackbar(true)
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Registration error:', error)
      setFormError(error instanceof Error ? error.message : 'Registration failed')
      setSnackbarMessage(error instanceof Error ? error.message : 'Registration failed')
      setOpenSnackbar(true)
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
              Enter your email and create a password to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add OAuth Buttons */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full h-12 px-5 py-2 bg-white hover:bg-gray-50"
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center gap-3 w-full">
                    <FaGoogle className="h-5 w-5" />
                    <span>Google</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 px-5 py-2 bg-white hover:bg-gray-50"
                  onClick={() => signIn('github', { callbackUrl: '/' })}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center gap-3 w-full">
                    <FaGithub className="h-5 w-5" />
                    <span>GitHub</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 px-5 py-2 bg-white hover:bg-gray-50"
                  onClick={() => signIn('twitter', { callbackUrl: '/' })}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center gap-3 w-full">
                    <FaTwitter className="h-5 w-5" />
                    <span>Twitter</span>
                  </div>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    OR CONTINUE WITH EMAIL
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" suppressHydrationWarning data-testid="registration-form">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Password</Label>
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring">
                      <span>Additional Information (Optional)</span>
                      <ChevronRightIcon
                        className={`${open ? 'rotate-90 transform' : ''} h-5 w-5`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              type="text"
                              {...register("firstName")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              type="text"
                              {...register("lastName")}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            type="text"
                            {...register("displayName")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            {...register("phoneNumber")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            {...register("dateOfBirth")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select 
                            onValueChange={(value) => {
                              register("gender").onChange({ 
                                target: { value, name: "gender" } 
                              })
                            }}
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
                      target: { name: 'privacyAccepted', value: checked }
                    });
                  }}
                />
                <label
                  htmlFor="privacyAccepted"
                  className="text-sm text-gray-600"
                >
                  I agree to the{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </label>
              </div>
              {errors.privacyAccepted && (
                <p className="text-sm text-red-500">
                  {errors.privacyAccepted.message}
                </p>
              )}

              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </div>
  )
}

