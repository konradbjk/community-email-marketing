'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Star,
  Copy,
  MessageSquare,
  User,
  Building2,
  ArrowLeft,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock prompt data - in real app this would come from the prompts passed from the list
const getPromptById = (id: string) => {
  const prompts = [
    {
      id: '550e8400-e29b-41d4-a716-446655440101',
      title: 'Drug Safety Analysis',
      description: 'Analyze pharmaceutical safety data and adverse events',
      content:
        'Please analyze the following drug safety data and identify potential adverse events, their frequency, and severity levels. Consider FDA guidelines and provide recommendations for risk mitigation strategies.\n\nWhen analyzing the data, please:\n1. Identify all reported adverse events\n2. Categorize them by system organ class (SOC)\n3. Calculate incidence rates\n4. Assess causality using WHO-UMC criteria\n5. Recommend risk mitigation strategies\n6. Suggest additional monitoring requirements\n\nProvide your analysis in a structured format suitable for regulatory submission.',
      category: 'Safety',
      type: 'final',
      isStarred: true,
      isPersonal: false,
      author: 'MErck',
      createdAt: '2024-01-15',
      usageCount: 42,
      variables: ['DRUG_NAME', 'SAFETY_DATA', 'TIME_PERIOD'],
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440102',
      title: 'Clinical Trial Design',
      description: 'Help design clinical trial protocols',
      content:
        'Design a comprehensive clinical trial protocol for [DRUG_NAME] targeting [CONDITION]. Include study objectives, patient inclusion/exclusion criteria, randomization strategy, primary and secondary endpoints, and statistical analysis plan.\n\nProtocol Structure:\n1. Study Title and Objectives\n2. Background and Rationale\n3. Study Design Overview\n4. Patient Population\n5. Treatment Arms and Randomization\n6. Study Procedures and Timeline\n7. Endpoints and Assessments\n8. Statistical Considerations\n9. Safety Monitoring\n10. Regulatory and Ethical Considerations\n\nEnsure compliance with ICH-GCP guidelines and relevant regulatory requirements.',
      category: 'Clinical Research',
      type: 'final',
      isStarred: false,
      isPersonal: false,
      author: 'Dr. Michael Chen',
      createdAt: '2024-01-10',
      usageCount: 28,
      variables: ['DRUG_NAME', 'CONDITION', 'TARGET_POPULATION'],
    },
  ];
  return prompts.find((p) => p.id === id) || null;
};

export default function PromptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const prompt = getPromptById(promptId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(prompt?.content || '');
  const [isStarred, setIsStarred] = useState(prompt?.isStarred || false);

  if (!prompt) {
    return (
      <>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <div className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5 text-muted-foreground' />
            <h1 className='text-lg font-semibold'>Prompt Not Found</h1>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>Prompt Not Found</h2>
            <p className='text-muted-foreground mb-4'>
              The prompt you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push('/prompts')}>
              Back to Prompts
            </Button>
          </div>
        </div>
      </>
    );
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success('Prompt copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleUsePrompt = () => {
    router.push(`/chat?prompt=${encodeURIComponent(prompt.content)}`);
  };

  const handleStarToggle = () => {
    setIsStarred(!isStarred);
    toast.success(isStarred ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleSaveEdit = () => {
    // In real app, save to backend
    setIsEditing(false);
    toast.success('Prompt updated successfully');
  };

  return (
    <>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <Button
          variant='ghost'
          onClick={() => router.push('/prompts')}
          className='gap-2 text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          All prompts
        </Button>
        <div className='ml-auto flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={handleStarToggle}
            className='gap-2'
          >
            <Star
              className={`h-4 w-4 ${
                isStarred ? 'fill-current text-yellow-500' : ''
              }`}
            />
            {isStarred ? 'Starred' : 'Star'}
          </Button>
          <Button
            variant='outline'
            onClick={handleCopyPrompt}
            className='gap-2'
          >
            <Copy className='h-4 w-4' />
            Copy
          </Button>
          <Button onClick={handleUsePrompt} className='gap-2'>
            <MessageSquare className='h-4 w-4' />
            Use in Chat
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Prompt Header */}
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <CardTitle className='text-2xl'>{prompt.title}</CardTitle>
                    <Badge
                      variant={
                        prompt.type === 'final' ? 'default' : 'secondary'
                      }
                    >
                      {prompt.type === 'final' ? 'Final Prompt' : 'Suggestion'}
                    </Badge>
                    <Badge variant='outline'>{prompt.category}</Badge>
                  </div>
                  <CardDescription className='text-base'>
                    {prompt.description}
                  </CardDescription>
                  <div className='flex items-center gap-6 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      {prompt.isPersonal ? (
                        <User className='h-4 w-4' />
                      ) : (
                        <Building2 className='h-4 w-4' />
                      )}
                      <span>{prompt.author}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <MessageSquare className='h-4 w-4' />
                      <span>{prompt.usageCount} uses</span>
                    </div>
                    <div>
                      <span>
                        Created{' '}
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {prompt.isPersonal && (
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Variables Card */}
          {prompt.variables && prompt.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Variables</CardTitle>
                <CardDescription>
                  This prompt uses the following variables that you can
                  customize:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {prompt.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant='outline'
                      className='font-mono'
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt Content */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Prompt Content</CardTitle>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCopyPrompt}
                  >
                    <Copy className='h-4 w-4 mr-2' />
                    Copy
                  </Button>
                  <Button size='sm' onClick={handleUsePrompt}>
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Use in Chat
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className='space-y-4'>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className='font-mono text-sm'
                  />
                  <div className='flex items-center gap-2'>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(prompt.content);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg'>
                  {prompt.content}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>
                    {prompt.usageCount}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Uses
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>4.8</div>
                  <div className='text-sm text-muted-foreground'>
                    Average Rating
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>12</div>
                  <div className='text-sm text-muted-foreground'>Favorites</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
