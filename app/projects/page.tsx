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
import { FolderOpen, Plus, Settings, Users, Clock } from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    displayName: '',
    description: '',
    instructions: '',
  });

  const handleProjectSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    console.log('Creating project:', newProject);
    setIsCreateDialogOpen(false);
    setNewProject({
      name: '',
      displayName: '',
      description: '',
      instructions: '',
    });
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
          <div className='flex flex-row justify-between'>
            <div className='space-y-2'>
              <h2 className='text-2xl font-bold'>Your Projects</h2>
              <p className='text-muted-foreground'>
                Organize your work with project-specific conversations and
                custom instructions
              </p>
            </div>
            <div className='ml-auto'>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className='gap-2'>
                    <Plus className='h-4 w-4' />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project to organize your conversations and
                      custom instructions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='displayName'>Display Name</Label>
                      <Input
                        id='displayName'
                        placeholder='Enter display name'
                        value={newProject.displayName}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>Project Name (URL-friendly)</Label>
                      <Input
                        id='name'
                        placeholder='project-name'
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='description'>Description</Label>
                      <Input
                        id='description'
                        placeholder='Brief description of the project'
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='instructions'>Custom Instructions</Label>
                      <Textarea
                        id='instructions'
                        placeholder='Custom instructions for AI interactions in this project'
                        value={newProject.instructions}
                        onChange={(e) =>
                          setNewProject((prev) => ({
                            ...prev,
                            instructions: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={!newProject.displayName || !newProject.name}
                    >
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {mockProjects.map((project) => (
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
                      {formatDistanceToNow(project.lastActivity, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockProjects.length === 0 && (
            <div className='text-center py-12'>
              <FolderOpen className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No projects yet</h3>
              <p className='text-muted-foreground mb-4'>
                Create your first project to get started with organized
                conversations
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className='gap-2'
              >
                <Plus className='h-4 w-4' />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
