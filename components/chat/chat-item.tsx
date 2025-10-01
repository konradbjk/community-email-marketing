'use client';

import { useState } from 'react';
import { MoreHorizontal, Star, Trash2, Archive, Edit } from 'lucide-react';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { RenameConversationDialog } from './rename-conversation-dialog';

interface ChatItemProps {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isStarred: boolean;
  isActive?: boolean;
  messageCount: number;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export function ChatItem({
  id,
  title,
  lastMessage,
  timestamp,
  isStarred,
  isActive = false,
  messageCount,
  onSelect,
  onToggleStar,
  onDelete,
  onArchive,
  onRename,
}: ChatItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SidebarMenuItem>
      <div
        className='group relative'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarMenuButton asChild isActive={isActive}>
          <div
            className='cursor-pointer flex flex-col gap-1 min-h-[64px] w-full pr-8'
            onClick={() => onSelect(id)}
          >
            {/* First row - Title only */}
            <div className='w-full flex items-start justify-start'>
              <span className='text-sm font-medium truncate flex-1 min-w-0 leading-tight'>
                {title}
              </span>
            </div>

            {/* Second row - Date and message count with small gap */}
            <div className='w-full flex items-center justify-between text-xs text-muted-foreground'>
              <span>{messageCount} messages</span>
              <span>{formatTime(timestamp)}</span>
            </div>
          </div>
        </SidebarMenuButton>

        {/* Dropdown menu - only visible on hover with high z-index */}
        <div className='absolute right-2 top-2 z-50'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction className={cn(
                'transition-opacity',
                (isHovered || isActive) ? 'opacity-100' : 'opacity-0'
              )}>
                <MoreHorizontal className='h-4 w-4' />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side='right' align='start' className='z-50'>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(id);
                  }}
                >
                  <Star
                    className={cn(
                      'h-4 w-4 mr-2',
                      isStarred && 'fill-current text-yellow-500',
                    )}
                  />
                  {isStarred ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRenameDialog(true);
                  }}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(id);
                  }}
                >
                  <Archive className='h-4 w-4 mr-2' />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>

      {/* Rename Dialog */}
      <RenameConversationDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        currentTitle={title}
        onSave={(newTitle) => onRename(id, newTitle)}
      />
    </SidebarMenuItem>
  );
}
