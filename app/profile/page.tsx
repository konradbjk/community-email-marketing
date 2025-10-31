'use client';

import { useState, useEffect } from 'react';
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
import { User, Briefcase, MessageSquare, Shield, Loader2 } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';
import type { UpdateProfileData } from '@/types/profile';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    role: '',
    department: '',
    region: '',
    roleDescription: '',
    aiResponseStyleId: '',
    customResponseStyle: '',
    customInstructions: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        role: profile.role || '',
        department: profile.department || '',
        region: profile.region || '',
        roleDescription: profile.roleDescription || '',
        aiResponseStyleId: profile.aiResponseStyleId || '',
        customResponseStyle: profile.customResponseStyle || '',
        customInstructions: profile.customInstructions || '',
      });
    }
  }, [profile]);

  const handleFieldChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleDoubleClick = (field: string) => {
    setEditingField(field);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      setHasChanges(false);
      setEditingField(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        role: profile.role || '',
        department: profile.department || '',
        region: profile.region || '',
        roleDescription: profile.roleDescription || '',
        aiResponseStyleId: profile.aiResponseStyleId || '',
        customResponseStyle: profile.customResponseStyle || '',
        customInstructions: profile.customInstructions || '',
      });
    }
    setHasChanges(false);
    setEditingField(null);
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

  if (isLoading) {
    return (
      <>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <div className='flex items-center gap-2'>
            <User className='h-5 w-5 text-muted-foreground' />
            <h1 className='text-lg font-semibold'>User Profile</h1>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <div className='flex items-center gap-2'>
            <User className='h-5 w-5 text-muted-foreground' />
            <h1 className='text-lg font-semibold'>User Profile</h1>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-destructive'>Failed to load profile</p>
        </div>
      </>
    );
  }

  return (
    <div className='flex flex-col h-full relative'>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <div className='flex items-center gap-2'>
          <User className='h-5 w-5 text-muted-foreground' />
          <h1 className='text-lg font-semibold'>User Profile</h1>
        </div>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto p-6 pb-24'>
        <div className='max-w-4xl mx-auto space-y-6'>
          <Tabs defaultValue='basic' className='space-y-6'>
            <TabsList>
              <TabsTrigger value='basic'>Basic Information</TabsTrigger>
              <TabsTrigger value='role'>Role & Context</TabsTrigger>
              <TabsTrigger value='ai'>AI Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-6'>
              {/* Immutable Section - From Merck SSO */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <Shield className='h-5 w-5' />
                        Identity Information
                      </CardTitle>
                      <CardDescription>
                        Managed by Merck SSO - Cannot be modified
                      </CardDescription>
                    </div>
                    <Badge variant='secondary' className='gap-1'>
                      <Shield className='h-3 w-3' />
                      From Merck SSO
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='merck_id'
                        className='text-muted-foreground'
                      >
                        Merck ID
                      </Label>
                      <Input
                        id='merck_id'
                        value={profile.merck_id}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email' className='text-muted-foreground'>
                        Email
                      </Label>
                      <Input
                        id='email'
                        value={profile.email}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name' className='text-muted-foreground'>
                        First Name
                      </Label>
                      <Input
                        id='name'
                        value={profile.name}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='surname'
                        className='text-muted-foreground'
                      >
                        Last Name
                      </Label>
                      <Input
                        id='surname'
                        value={profile.surname}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editable Section - User Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Double-click to edit your work-related information
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='department'>Department</Label>
                      <Input
                        id='department'
                        value={formData.department}
                        onChange={(e) =>
                          handleFieldChange('department', e.target.value)
                        }
                        onDoubleClick={() => handleDoubleClick('department')}
                        className={cn(
                          'cursor-pointer',
                          editingField === 'department' &&
                            'ring-2 ring-primary'
                        )}
                        placeholder='Double-click to edit'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='region'>Region</Label>
                      <Input
                        id='region'
                        value={formData.region}
                        onChange={(e) =>
                          handleFieldChange('region', e.target.value)
                        }
                        onDoubleClick={() => handleDoubleClick('region')}
                        className={cn(
                          'cursor-pointer',
                          editingField === 'region' && 'ring-2 ring-primary'
                        )}
                        placeholder='Double-click to edit'
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
                    Double-click to edit your role and responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='role'>Job Title</Label>
                    <Input
                      id='role'
                      value={formData.role}
                      onChange={(e) =>
                        handleFieldChange('role', e.target.value)
                      }
                      onDoubleClick={() => handleDoubleClick('role')}
                      className={cn(
                        'cursor-pointer',
                        editingField === 'role' && 'ring-2 ring-primary'
                      )}
                      placeholder='Double-click to edit'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='roleDescription'>Role Description</Label>
                    <Textarea
                      id='roleDescription'
                      rows={6}
                      placeholder='Double-click to edit...'
                      value={formData.roleDescription}
                      onChange={(e) =>
                        handleFieldChange('roleDescription', e.target.value)
                      }
                      onDoubleClick={() =>
                        handleDoubleClick('roleDescription')
                      }
                      className={cn(
                        'cursor-pointer',
                        editingField === 'roleDescription' &&
                          'ring-2 ring-primary'
                      )}
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
                      value={formData.aiResponseStyleId}
                      onValueChange={(value) => {
                        handleFieldChange('aiResponseStyleId', value);
                        setHasChanges(true);
                      }}
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
                    {(() => {
                      const selectedStyle = responseStyles.find(
                        (style) => style.id === formData.aiResponseStyleId
                      );
                      return selectedStyle ? (
                        <p className='text-sm text-muted-foreground'>
                          {selectedStyle.description}
                        </p>
                      ) : null;
                    })()}
                  </div>

                  {/* Custom Response Style - only show if Advanced is selected */}
                  {formData.aiResponseStyleId === 'advanced' && (
                    <div className='space-y-2'>
                      <Label htmlFor='customResponseStyle'>
                        Custom Response Style
                      </Label>
                      <Textarea
                        id='customResponseStyle'
                        rows={4}
                        placeholder='Double-click to edit...'
                        value={formData.customResponseStyle}
                        onChange={(e) =>
                          handleFieldChange(
                            'customResponseStyle',
                            e.target.value
                          )
                        }
                        onDoubleClick={() =>
                          handleDoubleClick('customResponseStyle')
                        }
                        className={cn(
                          'cursor-pointer',
                          editingField === 'customResponseStyle' &&
                            'ring-2 ring-primary'
                        )}
                      />
                      <p className='text-sm text-muted-foreground'>
                        Define exactly how you want the AI to respond to your
                        queries.
                      </p>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label htmlFor='customInstructions'>
                      Custom Instructions
                    </Label>
                    <Textarea
                      id='customInstructions'
                      rows={6}
                      placeholder='Double-click to edit...'
                      value={formData.customInstructions}
                      onChange={(e) =>
                        handleFieldChange('customInstructions', e.target.value)
                      }
                      onDoubleClick={() =>
                        handleDoubleClick('customInstructions')
                      }
                      className={cn(
                        'cursor-pointer',
                        editingField === 'customInstructions' &&
                          'ring-2 ring-primary'
                      )}
                    />
                    <p className='text-sm text-muted-foreground'>
                      Provide additional context or preferences for how the AI
                      should assist you.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Helper text at bottom */}
      <div className='absolute bottom-0 left-0 right-0 border-t bg-background'>
        <div className='flex items-center justify-between p-3 max-w-4xl mx-auto'>
          <p className='text-xs text-muted-foreground'>
            {hasChanges
              ? 'You have unsaved changes'
              : 'Double-click on any field to edit'}
          </p>
          {hasChanges && (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className='min-w-[80px]'
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className='h-3 w-3 animate-spin mr-1' />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
