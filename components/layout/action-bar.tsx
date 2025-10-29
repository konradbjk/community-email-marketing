'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import { useState } from 'react';
import { useCreateProject } from '@/hooks/use-projects';
import { useCreateConversation } from '@/hooks/use-conversations';
import { useSetActiveConversation } from '@/hooks/use-chat';
import { toast } from 'sonner';

export function ActionBar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    displayName: '',
    description: '',
    customInstructions: '',
  });

  const createProjectMutation = useCreateProject();
  const createConversationMutation = useCreateConversation();
  const setActiveConversation = useSetActiveConversation();

  // Determine which action button to show based on current route
  const showNewProject = pathname === '/projects';
  const showNewChat = pathname?.startsWith('/projects/') && params.id;
  const showCreatePrompt = pathname === '/prompts';

  const handleCreateProject = () => {
    createProjectMutation.mutate(
      {
        name: newProject.name,
        displayName: newProject.displayName,
        description: newProject.description || undefined,
        customInstructions: newProject.customInstructions || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success('Project created successfully');
          setIsProjectDialogOpen(false);
          setNewProject({
            name: '',
            displayName: '',
            description: '',
            customInstructions: '',
          });
          router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create project');
        },
      }
    );
  };

  const handleNewChat = () => {
    const projectId = params.id as string;
    createConversationMutation.mutate(
      { title: 'New Chat', projectId: projectId },
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

  const handleCreatePrompt = () => {
    // TODO: Implement prompt creation when prompts API is ready
    toast.info('Prompt creation coming soon');
  };

  // Don't render anything if no action is needed
  if (!showNewProject && !showNewChat && !showCreatePrompt) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {showNewProject && (
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize your conversations and custom
                instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter display name"
                  value={newProject.displayName}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Project Name (URL-friendly)</Label>
                <Input
                  id="name"
                  placeholder="project-name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the project"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Custom Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Custom instructions for AI interactions in this project"
                  value={newProject.customInstructions}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      customInstructions: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={
                  !newProject.displayName ||
                  !newProject.name ||
                  createProjectMutation.isPending
                }
              >
                {createProjectMutation.isPending
                  ? 'Creating...'
                  : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showNewChat && (
        <Button className="gap-2" onClick={handleNewChat}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      )}

      {showCreatePrompt && (
        <Button className="gap-2" onClick={handleCreatePrompt}>
          <Plus className="h-4 w-4" />
          Create Prompt
        </Button>
      )}
    </div>
  );
}
