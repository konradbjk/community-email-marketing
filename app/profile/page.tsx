'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Save, ArrowLeft, Briefcase, MessageSquare } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();

  // Mock user data - in real app this would come from auth/database
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@merck.com',
    role: 'Senior Marketing Manager',
    department: 'Oncology Business Unit',
    region: 'EMEA',
    roleDescription:
      'I lead marketing analytics for the Oncology portfolio, focusing on digital channel optimization and customer segmentation strategies. My primary responsibilities include analyzing email campaign performance, field vs digital interaction ratios, and cross-regional benchmarking.',
    aiResponseStyleId: '550e8400-e29b-41d4-a716-446655440001', // Using UUID for database storage
    customResponseStyle: '', // For advanced/custom style
    customInstructions:
      'When analyzing data, please focus on actionable insights and include benchmarks against regional averages. I prefer visual representations when discussing trends and always want recommendations prioritized by impact and feasibility.',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    // In real app, save to backend/database
    console.log('Profile saved:', tempProfile);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const responseStyles = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      label: 'Concise',
      description: 'Brief, to-the-point responses',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      label: 'Detailed',
      description: 'Comprehensive explanations with context',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      label: 'Analytical',
      description: 'Data-driven insights with methodology',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      label: 'Conversational',
      description: 'Friendly, collaborative tone',
    },
    {
      id: 'advanced',
      label: 'Advanced (Custom)',
      description: 'Define your own custom response style',
    },
  ];

  return (
    <>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <div className='flex items-center gap-2'>
          <User className='h-5 w-5 text-muted-foreground' />
          <h1 className='text-lg font-semibold'>User Profile</h1>
        </div>
        <div className='ml-auto'>
          {isEditing ? (
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className='gap-2'>
                <Save className='h-4 w-4' />
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          <div className='space-y-2'>
            <p className='text-muted-foreground'>
              Customize your profile and AI interaction preferences
            </p>
          </div>

          <Tabs defaultValue='basic' className='space-y-6'>
            <TabsList>
              <TabsTrigger value='basic'>Basic Information</TabsTrigger>
              <TabsTrigger value='role'>Role & Context</TabsTrigger>
              <TabsTrigger value='ai'>AI Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>Full Name</Label>
                      <Input
                        id='name'
                        value={isEditing ? tempProfile.name : profile.name}
                        onChange={(e) =>
                          setTempProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        value={isEditing ? tempProfile.email : profile.email}
                        onChange={(e) =>
                          setTempProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='department'>Department</Label>
                      <Input
                        id='department'
                        value={
                          isEditing
                            ? tempProfile.department
                            : profile.department
                        }
                        onChange={(e) =>
                          setTempProfile((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='region'>Region</Label>
                      <Input
                        id='region'
                        value={isEditing ? tempProfile.region : profile.region}
                        onChange={(e) =>
                          setTempProfile((prev) => ({
                            ...prev,
                            region: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='role' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Briefcase className='h-5 w-5' />
                    Role & Responsibilities
                  </CardTitle>
                  <CardDescription>
                    Help the AI understand your role and responsibilities for
                    better contextual responses
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='role'>Job Title</Label>
                    <Input
                      id='role'
                      value={isEditing ? tempProfile.role : profile.role}
                      onChange={(e) =>
                        setTempProfile((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='roleDescription'>Role Description</Label>
                    <Textarea
                      id='roleDescription'
                      rows={6}
                      placeholder='Describe your role, responsibilities, and areas of focus...'
                      value={
                        isEditing
                          ? tempProfile.roleDescription
                          : profile.roleDescription
                      }
                      onChange={(e) =>
                        setTempProfile((prev) => ({
                          ...prev,
                          roleDescription: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                    <p className='text-sm text-muted-foreground'>
                      This helps the AI provide more relevant and contextual
                      responses based on your responsibilities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='ai' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MessageSquare className='h-5 w-5' />
                    AI Response Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize how the AI responds to your questions and requests
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-3'>
                    <Label htmlFor='responseStyle'>Response Style</Label>
                    <Select
                      value={
                        isEditing
                          ? tempProfile.aiResponseStyleId
                          : profile.aiResponseStyleId
                      }
                      onValueChange={(value) =>
                        isEditing &&
                        setTempProfile((prev) => ({
                          ...prev,
                          aiResponseStyleId: value,
                        }))
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a response style' />
                      </SelectTrigger>
                      <SelectContent>
                        {responseStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Show description for selected style */}
                    {(() => {
                      const selectedStyle = responseStyles.find(
                        (style) =>
                          style.id ===
                          (isEditing
                            ? tempProfile.aiResponseStyleId
                            : profile.aiResponseStyleId),
                      );
                      return selectedStyle ? (
                        <p className='text-sm text-muted-foreground'>
                          {selectedStyle.description}
                        </p>
                      ) : null;
                    })()}
                  </div>

                  {/* Custom Response Style - only show if Advanced is selected */}
                  {(isEditing
                    ? tempProfile.aiResponseStyleId
                    : profile.aiResponseStyleId) === 'advanced' && (
                    <div className='space-y-2'>
                      <Label htmlFor='customResponseStyle'>
                        Custom Response Style
                      </Label>
                      <Textarea
                        id='customResponseStyle'
                        rows={4}
                        placeholder='Describe your preferred response style in detail...'
                        value={
                          isEditing
                            ? tempProfile.customResponseStyle
                            : profile.customResponseStyle
                        }
                        onChange={(e) =>
                          setTempProfile((prev) => ({
                            ...prev,
                            customResponseStyle: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                      <p className='text-sm text-muted-foreground'>
                        Define exactly how you want the AI to respond to your
                        queries.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
