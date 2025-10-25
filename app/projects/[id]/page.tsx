'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  FolderOpen,
  MessageSquare,
  Clock,
  FileText,
  Users,
  Edit3,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useConversations, useCreateConversation } from '@/hooks/use-conversations';
import { useSetActiveConversation } from '@/hooks/use-chat';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // Use TanStack Query hooks
  const { data: project, isLoading } = useProject(projectId);
  const { data: allConversations = [] } = useConversations({ projectId, includeArchived: true });
  const createConversationMutation = useCreateConversation();
  const updateProjectMutation = useUpdateProject();
  const setActiveConversation = useSetActiveConversation();

  // Filter conversations for this project
  const projectConversations = allConversations;
  const activeConversations = allConversations.filter(conv => !conv.isArchived);
  const archivedConversations = allConversations.filter(conv => conv.isArchived);

  const [isAddContextDialogOpen, setIsAddContextDialogOpen] = useState(false);
  const [isEditInstructionsDialogOpen, setIsEditInstructionsDialogOpen] =
    useState(false);
  const [newContext, setNewContext] = useState({
    title: '',
    content: '',
  });
  const [instructions, setInstructions] = useState('');

  // Update instructions when project loads
  useEffect(() => {
    if (project?.customInstructions) {
      setInstructions(project.customInstructions);
    }
  }, [project?.customInstructions]);

  if (isLoading) {
    return (
      <>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <div className='flex items-center gap-2'>
            <FolderOpen className='h-5 w-5 text-muted-foreground' />
            <h1 className='text-lg font-semibold'>Loading...</h1>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>Loading project...</h2>
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <div className='flex items-center gap-2'>
            <FolderOpen className='h-5 w-5 text-muted-foreground' />
            <h1 className='text-lg font-semibold'>Project Not Found</h1>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>Project Not Found</h2>
            <p className='text-muted-foreground mb-4'>
              The project you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </>
    );
  }

  const handleNewChat = () => {
    createConversationMutation.mutate(
      {
        title: 'New Chat',
        projectId: projectId,
      },
      {
        onSuccess: (data) => {
          setActiveConversation(data.id);
          router.push(`/chat/${data.id}`);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create conversation');
        },
      }
    );
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  const handleAddContext = () => {
    // TODO: Implement context upload API
    console.log('Adding context:', newContext);
    toast.info('Context upload feature coming soon');
    setIsAddContextDialogOpen(false);
    setNewContext({ title: '', content: '' });
  };

  const handleSaveInstructions = () => {
    updateProjectMutation.mutate(
      {
        id: projectId,
        data: {
          customInstructions: instructions,
        },
      },
      {
        onSuccess: () => {
          toast.success('Instructions saved successfully');
          setIsEditInstructionsDialogOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to save instructions');
        },
      }
    );
  };

  return (
    <>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <Button
          variant='ghost'
          onClick={() => router.push('/projects')}
          className='gap-2 text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          All projects
        </Button>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto'>
        <div className='max-w-7xl mx-auto p-6'>
          {/* Project Overview */}
          <div className='mb-8'>
            <div className='mb-4'>
              <h2 className='text-3xl font-bold mb-2'>
                {project.displayName}
              </h2>
              <p className='text-muted-foreground text-lg'>
                {project.description}
              </p>
            </div>

            <div className='flex items-center gap-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <MessageSquare className='h-4 w-4' />
                <span>
                  {projectConversations.length} conversation{projectConversations.length !== 1 ? 's' : ''}
                  ({activeConversations.length} active{archivedConversations.length > 0 ? `, ${archivedConversations.length} archived` : ''})
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <Users className='h-4 w-4' />
                <span>Team project</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>
                  Last active{' '}
                  {formatDistanceToNow(
                    new Date(project.updatedAt || project.createdAt),
                    { addSuffix: true },
                  )}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue='conversations' className='space-y-6'>
            <TabsList>
              <TabsTrigger value='conversations'>Conversations</TabsTrigger>
              <TabsTrigger value='instructions'>Instructions</TabsTrigger>
              <TabsTrigger value='files'>Files</TabsTrigger>
            </TabsList>

            <TabsContent value='conversations' className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Conversations</h3>
              </div>

              {/* Active Conversations */}
              {activeConversations.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium text-muted-foreground'>Active</h4>
                  <div className='grid gap-3'>
                    {activeConversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className='cursor-pointer hover:shadow-md transition-shadow'
                        onClick={() => handleConversationClick(conversation.id)}
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between'>
                            <div className='space-y-1'>
                              <CardTitle className='text-base'>
                                {conversation.title}
                              </CardTitle>
                            </div>
                            <div className='flex items-center gap-2'>
                              {conversation.isStarred && (
                                <Badge variant='secondary' className='text-xs'>
                                  Starred
                                </Badge>
                              )}
                              <span className='text-xs text-muted-foreground'>
                                {formatDistanceToNow(
                                  new Date(conversation.updatedAt),
                                  { addSuffix: true },
                                )}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Archived Conversations */}
              {archivedConversations.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='text-sm font-medium text-muted-foreground'>Archived</h4>
                  <div className='grid gap-3'>
                    {archivedConversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className='cursor-pointer hover:shadow-md transition-shadow opacity-60'
                        onClick={() => handleConversationClick(conversation.id)}
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between'>
                            <div className='space-y-1'>
                              <CardTitle className='text-base'>
                                {conversation.title}
                              </CardTitle>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                Archived
                              </Badge>
                              {conversation.isStarred && (
                                <Badge variant='secondary' className='text-xs'>
                                  Starred
                                </Badge>
                              )}
                              <span className='text-xs text-muted-foreground'>
                                {formatDistanceToNow(
                                  new Date(conversation.updatedAt),
                                  { addSuffix: true },
                                )}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {projectConversations.length === 0 && (
                <div className='text-center py-12'>
                  <MessageSquare className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    No conversations yet
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Start your first conversation in this project
                  </p>
                  <Button onClick={handleNewChat} className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Start First Conversation
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value='instructions' className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Custom Instructions</h3>
                <Dialog
                  open={isEditInstructionsDialogOpen}
                  onOpenChange={setIsEditInstructionsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' className='gap-2'>
                      <Edit3 className='h-4 w-4' />
                      Edit Instructions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>Edit Custom Instructions</DialogTitle>
                      <DialogDescription>
                        These instructions will be used for all AI interactions
                        in this project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='instructions'>Instructions</Label>
                        <Textarea
                          id='instructions'
                          rows={12}
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder='Enter custom instructions for this project...'
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setIsEditInstructionsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveInstructions}
                        disabled={updateProjectMutation.isPending}
                      >
                        {updateProjectMutation.isPending
                          ? 'Saving...'
                          : 'Save Instructions'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className='p-6'>
                  <div className='whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg'>
                    {project?.customInstructions || 'No custom instructions set'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='files' className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>
                  Project Files & Context
                </h3>
                <Dialog
                  open={isAddContextDialogOpen}
                  onOpenChange={setIsAddContextDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className='gap-2'>
                      <Plus className='h-4 w-4' />
                      Add Context
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Project Context</DialogTitle>
                      <DialogDescription>
                        Add files, documents, or other contextual information
                        for this project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='contextTitle'>Title</Label>
                        <Input
                          id='contextTitle'
                          placeholder='Context title'
                          value={newContext.title}
                          onChange={(e) =>
                            setNewContext((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='contextContent'>Content</Label>
                        <Textarea
                          id='contextContent'
                          rows={6}
                          placeholder='Paste content, upload files, or add relevant information...'
                          value={newContext.content}
                          onChange={(e) =>
                            setNewContext((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setIsAddContextDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddContext}
                        disabled={!newContext.title}
                      >
                        Add Context
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className='text-center py-12'>
                <FileText className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  No files uploaded yet
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Add project files, documents, or contextual information to
                  help the AI understand your project better.
                </p>
                <Button
                  onClick={() => setIsAddContextDialogOpen(true)}
                  className='gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Add First Context
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
