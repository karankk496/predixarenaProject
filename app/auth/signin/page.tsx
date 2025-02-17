'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';
import { toast } from "sonner";
import Link from 'next/link';
import { Label } from "@/components/ui/label";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Store user data
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        toast.success('Login successful!');
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        callbackUrl,
      });
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`);
      console.error('OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] shadow-none border-0 bg-transparent">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full h-12 px-5 py-2 bg-white hover:bg-gray-50"
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <FaGoogle className="h-5 w-5" />
                <span className="text-sm font-medium">Google</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 px-5 py-2 bg-white hover:bg-gray-50"
              onClick={() => handleOAuth('github')}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <FaGithub className="h-5 w-5" />
                <span className="text-sm font-medium">GitHub</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 px-5 py-2 bg-white hover:bg-gray-50"
              onClick={() => handleOAuth('twitter')}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <FaTwitter className="h-5 w-5" />
                <span className="text-sm font-medium">Twitter</span>
              </div>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-100 px-2 text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 bg-white"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-gray-800 text-white"
            >
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="text-black hover:underline font-medium"
            >
              Register
            </Link>
          </div>
          <Link 
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to main page
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 