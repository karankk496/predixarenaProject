'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { FaGoogle, FaTwitter, FaGithub } from 'react-icons/fa';
import { toast } from "sonner";
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the Privacy Policy and Terms of Service');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        router.push('/auth/signin');
        toast.success('Account created successfully! Please sign in.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('An error occurred during registration');
    }
  };

  const handleOAuthSignUp = (provider: string) => {
    toast.info(`${provider} sign up coming soon!`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Fill in the required information to get started. Additional details can be added later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Required Information</h2>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                We'll never share your email with anyone else.
              </p>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <div className="h-1 bg-gray-200 mt-1">
                <div 
                  className="h-full bg-red-500 transition-all"
                  style={{ 
                    width: `${Math.min(formData.password.length * 10, 100)}%`,
                    backgroundColor: formData.password.length > 8 ? '#22c55e' : '#ef4444'
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formData.password.length === 0 ? 'Enter password' : 
                 formData.password.length < 8 ? 'Weak password' : 'Strong password'}
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            asChild
          >
            <Link href="/auth/additional-info">
              Additional Information (Optional)
              <span>→</span>
            </Link>
          </Button>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground"
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

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full"
            onClick={handleSubmit}
          >
            Create account
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center"
              onClick={() => handleOAuthSignUp('Google')}
            >
              <FaGoogle className="h-5 w-5" />
              <span>Continue with Google</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center"
              onClick={() => handleOAuthSignUp('Twitter')}
            >
              <FaTwitter className="h-5 w-5" />
              <span>Continue with Twitter</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center"
              onClick={() => handleOAuthSignUp('GitHub')}
            >
              <FaGithub className="h-5 w-5" />
              <span>Continue with GitHub</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          <Link 
            href="/"
            className="text-sm text-center text-muted-foreground hover:underline"
          >
            ← Back to main page
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 