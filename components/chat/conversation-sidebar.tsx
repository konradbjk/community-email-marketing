'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  User,
  Settings,
  BookOpen,
  Archive,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { StarredSection } from './starred-section';
import { ConversationGroup } from './conversation-group';
import {
  useConversations,
  useActiveConversation,
  useToggleStarredConversation,
  useCreateNewConversation,
  useDeleteConversation,
  useArchiveConversation,
} from '@/hooks/use-chat';
import { getStarredProjects } from '@/lib/mock-data';

interface ConversationSidebarProps {
  activeConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
  onProjectSelect?: (projectId: string) => void;
  onNewChat?: () => void;
}

export function ConversationSidebar({
  activeConversationId,
  onConversationSelect,
  onProjectSelect,
  onNewChat,
}: ConversationSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showArchived, setShowArchived] = useState(false);

  // Check if we're on a project page
  const isProjectPage =
    pathname?.startsWith('/projects/') && pathname !== '/projects';

  // Get chat state from Zustand store
  const conversations = useConversations();
  const activeConversation = useActiveConversation();
  const toggleStarredConversation = useToggleStarredConversation();
  const createNewConversation = useCreateNewConversation();
  const deleteConversation = useDeleteConversation();
  const archiveConversation = useArchiveConversation();

  // Handle rename conversation
  const handleRenameConversation = (
    conversationId: string,
    newTitle: string,
  ) => {
    // TODO: Implement rename conversation logic in Zustand store
    console.log('Rename conversation:', conversationId, newTitle);
  };

  // Use active conversation ID from store if not provided as prop
  const currentActiveId = activeConversationId || activeConversation?.id;

  // Filter conversations based on archived state
  const filteredConversations = showArchived
    ? conversations.filter((conv) => conv.isArchived)
    : conversations.filter((conv) => !conv.isArchived);

  // Get starred items (only from non-archived conversations when not showing archived)
  const starredConversations = showArchived
    ? conversations.filter((conv) => conv.isStarred && conv.isArchived)
    : conversations.filter((conv) => conv.isStarred && !conv.isArchived);

  // Get starred projects
  const starredProjects = getStarredProjects();

  // Handler for toggling project stars (for now just a placeholder)
  const handleToggleProjectStar = (projectId: string) => {
    console.log('Toggle project star:', projectId);
    // TODO: Implement project star toggle logic
  };

  // Group conversations by date
  const conversationGroups = {
    today: conversations.filter((conv) => {
      const convDate = new Date(conv.timestamp);
      const now = new Date();
      return convDate.toDateString() === now.toDateString();
    }),
    yesterday: conversations.filter((conv) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const convDate = new Date(conv.timestamp);
      return convDate.toDateString() === yesterday.toDateString();
    }),
    last7days: conversations.filter((conv) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const convDate = new Date(conv.timestamp);
      return convDate >= sevenDaysAgo && convDate < twoDaysAgo;
    }),
    thismonth: conversations.filter((conv) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const convDate = new Date(conv.timestamp);
      return (
        convDate.getMonth() === new Date().getMonth() &&
        convDate.getFullYear() === new Date().getFullYear() &&
        convDate < sevenDaysAgo
      );
    }),
    older: conversations.filter((conv) => {
      const convDate = new Date(conv.timestamp);
      const now = new Date();
      return (
        convDate.getMonth() !== now.getMonth() ||
        convDate.getFullYear() !== now.getFullYear()
      );
    }),
  };

  const handleConversationSelect = (conversationId: string) => {
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
      const newConversationId = createNewConversation();
      router.push(`/chat/${newConversationId}`);
    }
  };

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
                starredConversations={starredConversations}
                starredProjects={starredProjects}
                activeConversationId={currentActiveId}
                onConversationClick={handleConversationSelect}
                onProjectClick={handleProjectSelect}
                onToggleConversationStar={toggleStarredConversation}
                onToggleProjectStar={handleToggleProjectStar}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Conversations grouped by date - Always visible */}
        {conversationGroups.today.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Today</SidebarGroupLabel>
            <SidebarGroupContent>
              <ConversationGroup
                group='today'
                conversations={conversationGroups.today}
                activeConversationId={currentActiveId}
                onConversationClick={handleConversationSelect}
                onToggleStar={toggleStarredConversation}
                onArchive={archiveConversation}
                onDelete={deleteConversation}
                onRename={handleRenameConversation}
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
                conversations={conversationGroups.yesterday}
                activeConversationId={currentActiveId}
                onConversationClick={handleConversationSelect}
                onToggleStar={toggleStarredConversation}
                onArchive={archiveConversation}
                onDelete={deleteConversation}
                onRename={handleRenameConversation}
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
                conversations={conversationGroups.last7days}
                activeConversationId={currentActiveId}
                onConversationClick={handleConversationSelect}
                onToggleStar={toggleStarredConversation}
                onArchive={archiveConversation}
                onDelete={deleteConversation}
                onRename={handleRenameConversation}
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
                conversations={conversationGroups.thismonth}
                activeConversationId={currentActiveId}
                onConversationClick={handleConversationSelect}
                onToggleStar={toggleStarredConversation}
                onArchive={archiveConversation}
                onDelete={deleteConversation}
                onRename={handleRenameConversation}
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
                conversations={conversationGroups.older}
                activeConversationId={currentActiveId}
                onConversationClick={handleConversationSelect}
                onToggleStar={toggleStarredConversation}
                onArchive={archiveConversation}
                onDelete={deleteConversation}
                onRename={handleRenameConversation}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sticky Footer */}
      <SidebarFooter className='border-t'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className='cursor-pointer'>
                    <User className='h-4 w-4' />
                    <span className='group-data-[collapsible=icon]:sr-only'>
                      Account
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
