'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  role: string;
  dateOfBirth: string | null;
  gender: string | null;
  isSuperUser: boolean;
  createdAt: string;
}

export function UserProfile() {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      fetchWithAuth(`/api/user/profile?userId=${parsedUserData.id}`)
        .then(data => {
          setProfileData(data);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data');
        });
    }
  }, []);

  if (!profileData) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm text-gray-500">Name</h3>
            <p>{profileData.firstName} {profileData.lastName}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Display Name</h3>
            <p>{profileData.displayName || 'Not set'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Email</h3>
            <p>{profileData.email}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Role</h3>
            <p className="capitalize">{profileData.role.toLowerCase()}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Date of Birth</h3>
            <p>{profileData.dateOfBirth || 'Not set'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Gender</h3>
            <p className="capitalize">{profileData.gender?.toLowerCase() || 'Not set'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Account Type</h3>
            <p>{profileData.isSuperUser ? 'Super User' : 'Regular User'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Member Since</h3>
            <p>{new Date(profileData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 