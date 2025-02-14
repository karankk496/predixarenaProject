'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {error === 'Configuration' 
              ? 'There is a problem with the server configuration.'
              : 'An error occurred during authentication.'}
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 