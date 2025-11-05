'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from '@/components/ui/ai/loader';
import { ConversationGroup } from './conversation-group';

type ConversationsSectionProps = {
  conversations: any[];
  isLoading?: boolean;
  isError?: boolean;
  activeConversationId?: string;
  onConversationClick: (conversationId: string) => void;
  onToggleStar: (conversationId: string) => void;
  onArchive: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, newTitle: string) => void;
};

function transformConversations(convs: any[]) {
  return convs.map((conv) => ({
    ...conv,
    lastMessage: conv.lastMessage || '',
    projectId: conv.projectId || undefined,
    timestamp: new Date(conv.updatedAt),
  }));
}

/**
 * Encapsulated conversations section:
 * - Always renders header with count once known: "Conversations (N)"
 * - Uses ScrollArea to render grouped conversations progressively
 * - Renders ambient fallback "no conversations found" on error or empty (not while loading)
 * - Suppresses toasts; does not block rendering with suspense
 */
export function ConversationsSection({
  conversations,
  isLoading = false,
  isError = false,
  activeConversationId,
  onConversationClick,
  onToggleStar,
  onArchive,
  onDelete,
  onRename,
}: ConversationsSectionProps) {
  const activeConversations = (conversations || []).filter(
    (c: any) => !c.isArchived,
  );

  // Group by date buckets
  const today = activeConversations.filter((conv: any) => {
    const convDate = new Date(conv.updatedAt);
    const now = new Date();
    return convDate.toDateString() === now.toDateString();
  });

  const yesterday = activeConversations.filter((conv: any) => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const convDate = new Date(conv.updatedAt);
    return convDate.toDateString() === y.toDateString();
  });

  const last7days = activeConversations.filter((conv: any) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const convDate = new Date(conv.updatedAt);
    return convDate >= sevenDaysAgo && convDate < twoDaysAgo;
  });

  const thismonth = activeConversations.filter((conv: any) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const convDate = new Date(conv.updatedAt);
    return (
      convDate.getMonth() === new Date().getMonth() &&
      convDate.getFullYear() === new Date().getFullYear() &&
      convDate < sevenDaysAgo
    );
  });

  const older = activeConversations.filter((conv: any) => {
    const convDate = new Date(conv.updatedAt);
    const now = new Date();
    return (
      convDate.getMonth() !== now.getMonth() ||
      convDate.getFullYear() !== now.getFullYear()
    );
  });

  const countKnown = !isLoading;
  const count = activeConversations.length;
  const headerLabel = countKnown ? `Conversations (${count})` : 'Conversations';

  const renderGroup = (label: string, items: any[]) => {
    if (!items.length) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <ConversationGroup
            group={label.toLowerCase() as any}
            conversations={transformConversations(items)}
            activeConversationId={activeConversationId}
            onConversationClick={onConversationClick}
            onToggleStar={onToggleStar}
            onArchive={onArchive}
            onDelete={onDelete}
            onRename={onRename}
          />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <div className='flex h-full flex-col'>
      <SidebarGroup>
        <SidebarGroupLabel>{headerLabel}</SidebarGroupLabel>
        <SidebarGroupContent />
      </SidebarGroup>

      <div className='flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          {isLoading ? (
            <SidebarGroup>
              <SidebarGroupContent>
                <div className='min-h-[6.75rem] flex items-center justify-center px-2'>
                  <Loader size={16} className='text-muted-foreground' />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : isError || activeConversations.length === 0 ? (
            <SidebarGroup>
              <SidebarGroupContent>
                <div className='min-h-[6.75rem] flex items-center px-2'>
                  <p className='text-xs text-muted-foreground'>
                    no conversations found
                  </p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <>
              {renderGroup('Today', today)}
              {renderGroup('Yesterday', yesterday)}
              {renderGroup('Last 7 days', last7days)}
              {renderGroup('This month', thismonth)}
              {renderGroup('Older', older)}
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
