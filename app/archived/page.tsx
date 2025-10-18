'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Archive,
  MessageSquare,
  FolderOpen,
  ArchiveRestore,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProjects, useArchiveProject } from '@/hooks/use-projects';
import { useConversations, useArchiveConversation } from '@/hooks/use-conversations';
import { useSetActiveConversation } from '@/hooks/use-chat';
import { toast } from 'sonner';

export default function ArchivedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'conversations'>('conversations');

  // Fetch archived items
  const { data: allProjects = [] } = useProjects({ includeArchived: true });
  const { data: allConversations = [] } = useConversations({ includeArchived: true });

  const archiveProject = useArchiveProject();
  const archiveConversation = useArchiveConversation();
  const setActiveConversation = useSetActiveConversation();

  // Filter archived items
  const archivedProjects = allProjects.filter(p => p.isArchived);
  const archivedConversations = allConversations.filter(c => c.isArchived);

  const handleUnarchiveProject = (projectId: string) => {
    archiveProject(projectId, true);
    toast.success('Project unarchived');
  };

  const handleUnarchiveConversation = (conversationId: string) => {
    archiveConversation(conversationId, true);
    toast.success('Conversation unarchived');
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  return (
    <>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <div className='flex items-center gap-2'>
          <Archive className='h-5 w-5 text-muted-foreground' />
          <h1 className='text-lg font-semibold'>Archive</h1>
        </div>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold mb-2'>Archived Items</h2>
            <p className='text-muted-foreground'>
              View and restore your archived projects and conversations
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className='space-y-6'>
            <TabsList>
              <TabsTrigger value='conversations' className='gap-2'>
                <MessageSquare className='h-4 w-4' />
                Conversations
                {archivedConversations.length > 0 && (
                  <Badge variant='secondary' className='ml-1'>
                    {archivedConversations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='projects' className='gap-2'>
                <FolderOpen className='h-4 w-4' />
                Projects
                {archivedProjects.length > 0 && (
                  <Badge variant='secondary' className='ml-1'>
                    {archivedProjects.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='conversations' className='space-y-4'>
              <div className='grid gap-3'>
                {archivedConversations.map((conversation) => (
                  <Card key={conversation.id} className='opacity-80 hover:opacity-100 transition-opacity'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div
                          className='space-y-1 flex-1 cursor-pointer'
                          onClick={() => handleConversationClick(conversation.id)}
                        >
                          <CardTitle className='text-base'>
                            {conversation.title}
                          </CardTitle>
                          {conversation.projectName && (
                            <p className='text-xs text-muted-foreground'>
                              Project: {conversation.projectName}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center gap-2'>
                          {conversation.isStarred && (
                            <Badge variant='secondary' className='text-xs'>
                              Starred
                            </Badge>
                          )}
                          <span className='text-xs text-muted-foreground whitespace-nowrap'>
                            {formatDistanceToNow(new Date(conversation.updatedAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-2 ml-2'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchiveConversation(conversation.id);
                            }}
                          >
                            <ArchiveRestore className='h-4 w-4' />
                            Unarchive
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {archivedConversations.length === 0 && (
                <div className='text-center py-12'>
                  <MessageSquare className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    No archived conversations
                  </h3>
                  <p className='text-muted-foreground'>
                    Archived conversations will appear here
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value='projects' className='space-y-4'>
              <div className='grid gap-3'>
                {archivedProjects.map((project) => (
                  <Card key={project.id} className='opacity-80 hover:opacity-100 transition-opacity'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div
                          className='space-y-1 flex-1 cursor-pointer'
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <CardTitle className='text-base'>
                            {project.displayName}
                          </CardTitle>
                          {project.description && (
                            <p className='text-sm text-muted-foreground'>
                              {project.description}
                            </p>
                          )}
                          <div className='flex items-center gap-4 text-xs text-muted-foreground pt-1'>
                            <span>{project.conversationCount} conversations</span>
                            <span>
                              Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {project.isStarred && (
                            <Badge variant='secondary' className='text-xs'>
                              Starred
                            </Badge>
                          )}
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-2'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchiveProject(project.id);
                            }}
                          >
                            <ArchiveRestore className='h-4 w-4' />
                            Unarchive
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {archivedProjects.length === 0 && (
                <div className='text-center py-12'>
                  <FolderOpen className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    No archived projects
                  </h3>
                  <p className='text-muted-foreground'>
                    Archived projects will appear here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
