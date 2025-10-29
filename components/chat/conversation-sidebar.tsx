'use client';

import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Plus,
  MessageSquare,
  FolderOpen,
  BookOpen,
  Archive,
} from 'lucide-react';
import { StarredSection } from './starred-section';
import { ConversationGroup } from './conversation-group';
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useArchiveConversation,
  useToggleStarConversation,
  useRenameConversation,
} from '@/hooks/use-conversations';
import { useProjects } from '@/hooks/use-projects';
import { useActiveConversationId, useSetActiveConversation } from '@/hooks/use-chat';
import { UserBar } from '@/components/layout/user-bar';

interface ConversationSidebarProps {
  activeConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
  onProjectSelect?: (projectId: string) => void;
  onNewChat?: () => void;
}

export function ConversationSidebar({
  activeConversationId: propActiveConversationId,
  onConversationSelect,
  onProjectSelect,
  onNewChat,
}: ConversationSidebarProps) {
  const router = useRouter();

  // Get UI state from Zustand
  const storeActiveConversationId = useActiveConversationId();
  const setActiveConversation = useSetActiveConversation();

  // Get server data from TanStack Query
  const { data: conversations = [] } = useConversations({ includeArchived: true });
  const { data: starredProjects = [] } = useProjects({ isStarred: true });

  // Mutations
  const createConversationMutation = useCreateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const archiveConversationMutation = useArchiveConversation();
  const toggleStarMutation = useToggleStarConversation();
  const renameMutation = useRenameConversation();

  // Use prop if provided, otherwise use store
  const currentActiveId = propActiveConversationId || storeActiveConversationId;

  // Filter conversations
  const activeConversations = conversations.filter((conv) => !conv.isArchived);
  const starredConversations = conversations.filter((conv) => conv.isStarred && !conv.isArchived);

  // Group conversations by date
  const conversationGroups = {
    today: activeConversations.filter((conv) => {
      const convDate = new Date(conv.updatedAt);
      const now = new Date();
      return convDate.toDateString() === now.toDateString();
    }),
    yesterday: activeConversations.filter((conv) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const convDate = new Date(conv.updatedAt);
      return convDate.toDateString() === yesterday.toDateString();
    }),
    last7days: activeConversations.filter((conv) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const convDate = new Date(conv.updatedAt);
      return convDate >= sevenDaysAgo && convDate < twoDaysAgo;
    }),
    thismonth: activeConversations.filter((conv) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const convDate = new Date(conv.updatedAt);
      return (
        convDate.getMonth() === new Date().getMonth() &&
        convDate.getFullYear() === new Date().getFullYear() &&
        convDate < sevenDaysAgo
      );
    }),
    older: activeConversations.filter((conv) => {
      const convDate = new Date(conv.updatedAt);
      const now = new Date();
      return (
        convDate.getMonth() !== now.getMonth() ||
        convDate.getFullYear() !== now.getFullYear()
      );
    }),
  };

  // Handlers
  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    } else {
      router.push(`/chat/${conversationId}`);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    } else {
      router.push(`/projects/${projectId}`);
    }
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      // Create new conversation and navigate
      createConversationMutation.mutate(
        { title: 'New Chat' },
        {
          onSuccess: (data) => {
            setActiveConversation(data.id);
            router.push(`/chat/${data.id}`);
          },
        }
      );
    }
  };

  const handleToggleStar = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      toggleStarMutation(conversationId, conversation.isStarred);
    }
  };

  const handleArchive = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      archiveConversationMutation(conversationId, conversation.isArchived);
    }
  };

  const handleDelete = (conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
  };

  const handleRename = (conversationId: string, newTitle: string) => {
    renameMutation(conversationId, newTitle);
  };

  const handleToggleProjectStar = (projectId: string) => {
    // TODO: Implement project star toggle
    console.log('Toggle project star:', projectId);
  };

  // Transform conversations to match ConversationGroup expected format
  const transformedConversations = (convs: typeof conversations) =>
    convs.map((conv) => ({
      ...conv,
      lastMessage: conv.lastMessage || '',
      projectId: conv.projectId || undefined,
      timestamp: new Date(conv.updatedAt),
    }));

  return (
    <Sidebar collapsible='offcanvas' className='border-r'>
      {/* Sticky Header */}
      <SidebarHeader className='border-b'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  onClick={handleNewChat}
                  className='w-full gap-2 justify-start'
                  disabled={createConversationMutation.isPending}
                >
                  <Plus className='h-4 w-4' />
                  <span className='group-data-[collapsible=icon]:sr-only'>
                    New Chat
                  </span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Tabs - Vertical Layout */}
        <SidebarGroup className='pt-0'>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => router.push('/chat')}>
                  <div className='cursor-pointer'>
                    <MessageSquare className='h-4 w-4' />
                    <span className='group-data-[collapsible=icon]:sr-only'>
                      Chats
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onClick={() => router.push('/projects')}
                >
                  <div className='cursor-pointer'>
                    <FolderOpen className='h-4 w-4' />
                    <span className='group-data-[collapsible=icon]:sr-only'>
                      Projects
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onClick={() => router.push('/prompts')}
                >
                  <div className='cursor-pointer'>
                    <BookOpen className='h-4 w-4' />
                    <span className='group-data-[collapsible=icon]:sr-only'>
                      Prompts
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onClick={() => router.push('/archived')}
                >
                  <div className='cursor-pointer'>
                    <Archive className='h-4 w-4' />
                    <span className='group-data-[collapsible=icon]:sr-only'>
                      Archive
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      {/* Scrollable Content */}
      <SidebarContent>
        {/* Starred Section */}
        {(starredConversations.length > 0 || starredProjects.length > 0) && (
          <SidebarGroup>
            <SidebarGroupLabel>Starred</SidebarGroupLabel>
            <SidebarGroupContent>
              <StarredSection
                starredConversations={transformedConversations(starredConversations)}
                starredProjects={starredProjects}
                activeConversationId={currentActiveId || undefined}
                onConversationClick={handleConversationSelect}
                onProjectClick={handleProjectSelect}
                onToggleConversationStar={handleToggleStar}
                onToggleProjectStar={handleToggleProjectStar}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Conversations grouped by date */}
        {conversationGroups.today.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Today</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationGroup
                group='today'
                conversations={transformedConversations(conversationGroups.today)}
                activeConversationId={currentActiveId || undefined}
                onConversationClick={handleConversationSelect}
                onToggleStar={handleToggleStar}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {conversationGroups.yesterday.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationGroup
                group='yesterday'
                conversations={transformedConversations(conversationGroups.yesterday)}
                activeConversationId={currentActiveId || undefined}
                onConversationClick={handleConversationSelect}
                onToggleStar={handleToggleStar}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {conversationGroups.last7days.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Last 7 days</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationGroup
                group='last7days'
                conversations={transformedConversations(conversationGroups.last7days)}
                activeConversationId={currentActiveId || undefined}
                onConversationClick={handleConversationSelect}
                onToggleStar={handleToggleStar}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {conversationGroups.thismonth.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>This month</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationGroup
                group='thismonth'
                conversations={transformedConversations(conversationGroups.thismonth)}
                activeConversationId={currentActiveId || undefined}
                onConversationClick={handleConversationSelect}
                onToggleStar={handleToggleStar}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {conversationGroups.older.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Older</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationGroup
                group='older'
                conversations={transformedConversations(conversationGroups.older)}
                activeConversationId={currentActiveId || undefined}
                onConversationClick={handleConversationSelect}
                onToggleStar={handleToggleStar}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sticky Footer */}
      <SidebarFooter className='border-t p-2'>
        <UserBar />
      </SidebarFooter>
    </Sidebar>
  );
}
