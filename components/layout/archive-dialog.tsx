'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, RotateCcw, Trash2 } from 'lucide-react';
import { useConversations, useUpdateConversation, useDeleteConversation } from '@/hooks/use-conversations';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveDialog({ open, onOpenChange }: ArchiveDialogProps) {
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch all conversations including archived
  const { data: allConversations = [] } = useConversations({
    includeArchived: true
  });

  // Filter to only archived conversations
  const archivedConversations = useMemo(() =>
    allConversations.filter(conv => conv.isArchived),
    [allConversations]
  );

  // Mutations
  const updateConversationMutation = useUpdateConversation();
  const deleteConversationMutation = useDeleteConversation();

  const handleRestoreConversation = (conversationId: string) => {
    updateConversationMutation.mutate(
      {
        id: conversationId,
        data: { isArchived: false },
      },
      {
        onSuccess: () => {
          toast.success('Conversation restored');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to restore conversation');
        },
      }
    );
  };

  const handleDeleteClick = (conversationId: string) => {
    setDeleteConversationId(conversationId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteConversationId) return;

    deleteConversationMutation.mutate(deleteConversationId, {
      onSuccess: () => {
        toast.success('Conversation permanently deleted');
        setDeleteConversationId(null);
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete conversation');
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Archived Conversations</DialogTitle>
            <DialogDescription>
              View and manage your archived conversations
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto mt-4">
            {archivedConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No archived conversations</h3>
                <p className="text-muted-foreground text-sm">
                  Archived conversations will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {archivedConversations.map((conversation) => (
                  <Card key={conversation.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {conversation.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            Archived{' '}
                            {formatDistanceToNow(new Date(conversation.updatedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreConversation(conversation.id)}
                            disabled={updateConversationMutation.isPending}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(conversation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete conversation?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              conversation and all its messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteConversationMutation.isPending}
            >
              {deleteConversationMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
