'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Folder, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface StarredSectionProps {
  starredConversations: any[];
  starredProjects: any[];
  activeConversationId?: string;
  onConversationClick: (conversationId: string) => void;
  onProjectClick: (projectId: string) => void;
  onToggleConversationStar: (conversationId: string) => void;
  onToggleProjectStar: (projectId: string) => void;
  // Sidebar UX states
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * Collapsed-only favourites section:
 * - Always renders content (header is provided by parent SidebarGroupLabel)
 * - Shows exactly 3 skeleton rows while loading
 * - Shows ambient empty text on error or zero favourites
 * - Renders up to 3 items; "Show More" link-row (py-2) appears when total > 3
 * - Single-line truncation with fixed row height; suppresses error toasts
 */
export function StarredSection({
  starredConversations,
  starredProjects,
  activeConversationId,
  onConversationClick,
  onProjectClick,
  onToggleConversationStar,
  onToggleProjectStar,
  isLoading = false,
  isError = false,
}: StarredSectionProps) {
  // Combine conversations and projects for total count and display
  const allStarredItems = [
    ...starredConversations.map((item) => ({
      ...item,
      type: 'conversation' as const,
    })),
    ...starredProjects.map((item) => ({ ...item, type: 'project' as const })),
  ];
  const totalCount = allStarredItems.length;
  const displayedItems = allStarredItems.slice(0, 3);
  const hasMoreItems = totalCount > 3;

  // Create hover states for menu visibility
  const [hoveredItems, setHoveredItems] = useState<Record<string, boolean>>({});

  return (
    <div className='space-y-2'>
      {/* Items area: fixed height of 3 rows (h-9 × 3) to prevent layout shift */}
      <div className='h-[6.75rem]'>
        {isLoading ? (
          <div className='flex flex-col'>
            <div className='h-9 rounded-lg px-2'>
              <div className='flex h-full items-center gap-3'>
                <Skeleton className='h-4 w-4 rounded' />
                <Skeleton className='h-3 w-[70%] rounded' />
              </div>
            </div>
            <div className='h-9 rounded-lg px-2'>
              <div className='flex h-full items-center gap-3'>
                <Skeleton className='h-4 w-4 rounded' />
                <Skeleton className='h-3 w-[70%] rounded' />
              </div>
            </div>
            <div className='h-9 rounded-lg px-2'>
              <div className='flex h-full items-center gap-3'>
                <Skeleton className='h-4 w-4 rounded' />
                <Skeleton className='h-3 w-[70%] rounded' />
              </div>
            </div>
          </div>
        ) : isError || totalCount === 0 ? (
          <div className='flex items-center h-full px-2'>
            <p className='text-xs text-muted-foreground'>
              No starred conversations or projects
            </p>
          </div>
        ) : (
          <div className='flex flex-col'>
            {displayedItems.map((item) => {
              if (item.type === 'conversation') {
                const conversation = item;
                const itemKey = `conv-${conversation.id}`;
                const isHovered = hoveredItems[itemKey] || false;
                return (
                  <div
                    key={`starred-conv-${conversation.id}`}
                    className={cn(
                      'relative flex h-9 items-center gap-3 rounded-lg px-2 cursor-pointer transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      activeConversationId === conversation.id &&
                        'bg-sidebar-accent text-sidebar-accent-foreground',
                    )}
                    onClick={() => onConversationClick(conversation.id)}
                    onMouseEnter={() =>
                      setHoveredItems((prev) => ({ ...prev, [itemKey]: true }))
                    }
                    onMouseLeave={() =>
                      setHoveredItems((prev) => ({ ...prev, [itemKey]: false }))
                    }
                  >
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium truncate whitespace-nowrap overflow-ellipsis'>
                        {conversation.title}
                      </h3>
                    </div>

                    <div className='absolute right-2 top-2 z-50'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className={cn(
                              'h-6 w-6 hover:bg-sidebar-accent transition-opacity',
                              isHovered ? 'opacity-100' : 'opacity-0',
                            )}
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side='right'
                          align='start'
                          className='z-50'
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleConversationStar(conversation.id);
                            }}
                          >
                            <Star className='h-4 w-4 mr-2 fill-yellow-400 text-yellow-400' />
                            Remove from favourites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              } else {
                const project = item;
                const itemKey = `proj-${project.id}`;
                const isProjectHovered = hoveredItems[itemKey] || false;
                return (
                  <div
                    key={`starred-proj-${project.id}`}
                    className={cn(
                      'relative flex h-9 items-center gap-3 rounded-lg px-2 cursor-pointer transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                    onClick={() => onProjectClick(project.id)}
                    onMouseEnter={() =>
                      setHoveredItems((prev) => ({ ...prev, [itemKey]: true }))
                    }
                    onMouseLeave={() =>
                      setHoveredItems((prev) => ({ ...prev, [itemKey]: false }))
                    }
                  >
                    <div className='flex-shrink-0'>
                      <Folder className='h-4 w-4 text-primary' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium truncate whitespace-nowrap overflow-ellipsis'>
                        {project.displayName}
                      </h3>
                    </div>

                    <div className='absolute right-2 top-2 z-50'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className={cn(
                              'h-6 w-6 hover:bg-sidebar-accent transition-opacity',
                              isProjectHovered ? 'opacity-100' : 'opacity-0',
                            )}
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side='right'
                          align='start'
                          className='z-50'
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleProjectStar(project.id);
                            }}
                          >
                            <Star className='h-4 w-4 mr-2 fill-yellow-400 text-yellow-400' />
                            Remove from favourites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Show More area: always reserved to keep static section height */}
      <div className='px-2'>
        {hasMoreItems ? (
          <Link
            href='/favourites'
            className='block py-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
          >
            Show More
          </Link>
        ) : (
          <div className='py-1'>
            {/* Reserve exact row height even when no link */}
            <span className='text-xs invisible'>Show More</span>
          </div>
        )}
      </div>
    </div>
  );
}
