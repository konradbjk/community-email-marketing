import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Types
export interface Conversation {
  id: string
  title: string
  isStarred: boolean
  isArchived: boolean
  projectId?: string | null
  projectName?: string | null
  messageCount: number
  lastMessage?: string
  createdAt: string
  updatedAt: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Array<{
    id: string
    role: "user" | "assistant" | "system" | "tool"
    content: string
    createdAt: string
    toolInvocations?: any[] | null
    attachments?: any[] | null
  }>
}

export interface ConversationFilters {
  includeArchived?: boolean
  projectId?: string
  isStarred?: boolean
}

export interface CreateConversationData {
  title: string
  projectId?: string | null
  initialMessage?: string
}

export interface UpdateConversationData {
  title?: string
  isStarred?: boolean
  isArchived?: boolean
}

// API Functions
async function fetchConversations(filters?: ConversationFilters): Promise<Conversation[]> {
  const params = new URLSearchParams()

  if (filters?.includeArchived) {
    params.append("include_archived", "true")
  }
  if (filters?.projectId) {
    params.append("project_id", filters.projectId)
  }
  if (filters?.isStarred) {
    params.append("is_starred", "true")
  }

  const url = `/api/conversations${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch conversations")
  }

  return response.json()
}

async function fetchConversation(id: string): Promise<ConversationWithMessages> {
  const response = await fetch(`/api/conversations/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch conversation")
  }

  return response.json()
}

async function createConversation(data: CreateConversationData): Promise<Conversation> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create conversation")
  }

  return response.json()
}

async function updateConversation(id: string, data: UpdateConversationData): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update conversation")
  }

  return response.json()
}

async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete conversation")
  }
}

// Query Hooks
export function useConversations(filters?: ConversationFilters) {
  return useQuery({
    queryKey: ["conversations", filters],
    queryFn: () => fetchConversations(filters),
  })
}

export function useConversation(id: string | null | undefined) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  })
}

// Mutation Hooks
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useUpdateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationData }) =>
      updateConversation(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversations"] })

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>(["conversations"])
      const previousConversation = queryClient.getQueryData<ConversationWithMessages>(["conversations", id])

      // Optimistically update conversations list
      if (previousConversations) {
        queryClient.setQueryData<Conversation[]>(
          ["conversations"],
          previousConversations.map((conv) =>
            conv.id === id ? { ...conv, ...data } : conv
          )
        )
      }

      // Optimistically update single conversation
      if (previousConversation) {
        queryClient.setQueryData<ConversationWithMessages>(
          ["conversations", id],
          { ...previousConversation, ...data }
        )
      }

      return { previousConversations, previousConversation }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations"], context.previousConversations)
      }
      if (context?.previousConversation) {
        queryClient.setQueryData(["conversations", id], context.previousConversation)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteConversation,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["conversations"] })

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>(["conversations"])

      // Optimistically remove from list
      if (previousConversations) {
        queryClient.setQueryData<Conversation[]>(
          ["conversations"],
          previousConversations.filter((conv) => conv.id !== id)
        )
      }

      return { previousConversations }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations"], context.previousConversations)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

// Convenience hooks for common operations
export function useToggleStarConversation() {
  const updateMutation = useUpdateConversation()

  return (id: string, currentStarred: boolean) => {
    return updateMutation.mutate({
      id,
      data: { isStarred: !currentStarred },
    })
  }
}

export function useArchiveConversation() {
  const updateMutation = useUpdateConversation()

  return (id: string, currentArchived: boolean) => {
    return updateMutation.mutate({
      id,
      data: { isArchived: !currentArchived },
    })
  }
}

export function useRenameConversation() {
  const updateMutation = useUpdateConversation()

  return (id: string, newTitle: string) => {
    return updateMutation.mutate({
      id,
      data: { title: newTitle },
    })
  }
}
