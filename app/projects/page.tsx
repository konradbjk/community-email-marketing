'use client';

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
import { FolderOpen, Settings, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProjects } from '@/hooks/use-projects';

export default function ProjectsPage() {
  const router = useRouter();

  // Use TanStack Query hooks
  const { data: projects = [], isLoading } = useProjects();

  const handleProjectSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <div className='flex items-center gap-2'>
          <FolderOpen className='h-5 w-5 text-muted-foreground' />
          <h1 className='text-lg font-semibold'>Projects</h1>
        </div>
      </header>

      {/* Content */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-6xl mx-auto space-y-6'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-bold'>Your Projects</h2>
            <p className='text-muted-foreground'>
              Organize your work with project-specific conversations and
              custom instructions
            </p>
          </div>

          {isLoading ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>Loading projects...</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className='cursor-pointer hover:shadow-md transition-shadow'
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1'>
                          <CardTitle className='text-lg'>
                            {project.displayName}
                          </CardTitle>
                          <CardDescription className='line-clamp-2'>
                            {project.description}
                          </CardDescription>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Settings className='h-4 w-4' />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center justify-between text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <FolderOpen className='h-4 w-4' />
                          <span>{project.conversationCount} conversations</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-1 text-sm text-muted-foreground mt-2'>
                        <Clock className='h-4 w-4' />
                        <span>
                          Active{' '}
                          {formatDistanceToNow(
                            new Date(project.updatedAt || project.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {projects.length === 0 && (
                <div className='text-center py-12'>
                  <FolderOpen className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    No projects yet
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Create your first project using the button in the top-right corner
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
