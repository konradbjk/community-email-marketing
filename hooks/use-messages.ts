"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Message } from "@/types/messages"

interface ApiMessage {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  createdAt: string
  toolInvocations?: any[] | null
  attachments?: any[] | null
}

interface FetchMessagesResponse {
  messages: ApiMessage[]
}

const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await fetch(`/api/conversations/${conversationId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch messages")
  }

  const data = (await response.json()) as FetchMessagesResponse

  if (!Array.isArray(data.messages)) {
    return []
  }

  return data.messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: new Date(message.createdAt),
    toolInvocations: message.toolInvocations ?? undefined,
    attachments: message.attachments ?? undefined,
    metadata: undefined,
  }))
}

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  })
}

interface SendMessageParams {
  conversationId: string
  message: string
  attachments?: Array<{
    name: string
    url: string
    contentType: string
  }>
}

interface SendMessageResponse {
  userMessage: ApiMessage
  aiMessage?: ApiMessage | null
  error?: string
  details?: string
}

const sendMessage = async (params: SendMessageParams): Promise<SendMessageResponse> => {
  const response = await fetch(`/api/conversations/${params.conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: params.message,
      attachments: params.attachments,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error ?? "Failed to send message")
  }

  return response.json()
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ conversationId, message, attachments }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] })

      const previousMessages = queryClient.getQueryData<Message[]>(["messages", conversationId])

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        role: "user",
        content: message,
        createdAt: new Date(),
        attachments,
      }

      queryClient.setQueryData<Message[]>(["messages", conversationId], (old = []) => [
        ...old,
        optimisticMessage,
      ])

      return { previousMessages, optimisticId: optimisticMessage.id, conversationId }
    },
    onSuccess: (data, variables, context) => {
      const conversationId = variables.conversationId

      queryClient.setQueryData<Message[]>(["messages", conversationId], (old = []) => {
        const withoutOptimistic = old.filter(
          (message) => message.id !== context?.optimisticId
        )

        const nextMessages: Message[] = [
          ...withoutOptimistic,
          {
            id: data.userMessage.id,
            role: data.userMessage.role,
            content: data.userMessage.content,
            createdAt: new Date(data.userMessage.createdAt),
            attachments: data.userMessage.attachments ?? undefined,
          },
        ]

      if (data.aiMessage) {
        nextMessages.push({
          id: data.aiMessage.id,
          role: data.aiMessage.role,
          content: data.aiMessage.content,
          createdAt: new Date(data.aiMessage.createdAt),
          toolInvocations: data.aiMessage.toolInvocations ?? undefined,
          metadata: {
            retryMessage: variables.message,
          },
        })
        } else if (data.error) {
          nextMessages.push({
            id: `error-${Date.now()}`,
            role: "assistant",
            content: data.error,
            createdAt: new Date(),
            metadata: {
              type: "error",
              retryMessage: variables.message,
            },
          })
        }

        return nextMessages
      })

      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversations", conversationId] })

      if (data.error) {
        toast.error(data.error)
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", context.conversationId], context.previousMessages)
      }

      const message = error instanceof Error ? error.message : "Failed to send message"
      toast.error(message)
    },
  })
}

interface UpdateMessageParams {
  conversationId: string
  messageId: string
  message: string
  regenerate?: boolean
}

const updateMessage = async (params: UpdateMessageParams): Promise<SendMessageResponse> => {
  const response = await fetch(
    `/api/conversations/${params.conversationId}/messages/${params.messageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: params.message,
        regenerate: params.regenerate ?? false,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error ?? "Failed to update message")
  }

  return response.json()
}

export const useUpdateMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMessage,
    onMutate: async ({ conversationId, messageId, message }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] })

      const previousMessages = queryClient.getQueryData<Message[]>(["messages", conversationId])

      queryClient.setQueryData<Message[]>(["messages", conversationId], (old = []) => {
        const filtered = old.filter((item) => !item.id.startsWith("error-"))

        return filtered.map((item) =>
          item.id === messageId
            ? {
                ...item,
                content: message,
                metadata: undefined,
              }
            : item
        )
      })

      return { previousMessages, conversationId }
    },
    onSuccess: (data, variables, context) => {
      const conversationId = variables.conversationId

      queryClient.setQueryData<Message[]>(["messages", conversationId], (old = []) => {
        const withoutErrors = old.filter((item) => !item.id.startsWith("error-"))

        const updatedMessages = withoutErrors.map((item) =>
          item.id === data.userMessage.id
            ? {
                id: data.userMessage.id,
                role: data.userMessage.role,
                content: data.userMessage.content,
                createdAt: new Date(data.userMessage.createdAt),
                attachments: data.userMessage.attachments ?? undefined,
              }
            : item
        )

        const hasUserMessage = updatedMessages.some((item) => item.id === data.userMessage.id)
        const baseMessages = hasUserMessage
          ? updatedMessages
          : [
              ...updatedMessages,
              {
                id: data.userMessage.id,
                role: data.userMessage.role,
                content: data.userMessage.content,
                createdAt: new Date(data.userMessage.createdAt),
                attachments: data.userMessage.attachments ?? undefined,
              },
            ]

        if (data.aiMessage) {
          return [
            ...baseMessages,
            {
              id: data.aiMessage.id,
              role: data.aiMessage.role,
              content: data.aiMessage.content,
              createdAt: new Date(data.aiMessage.createdAt),
              toolInvocations: data.aiMessage.toolInvocations ?? undefined,
              metadata: {
                retryMessage: variables.message,
              },
            },
          ]
        }

        if (data.error) {
          return [
            ...baseMessages,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: data.error,
              createdAt: new Date(),
              metadata: {
                type: "error",
                retryMessage: variables.message,
              },
            },
          ]
        }

        return baseMessages
      })

      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversations", conversationId] })

      if (data.error) {
        toast.error(data.error)
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", variables.conversationId], context.previousMessages)
      }

      const message = error instanceof Error ? error.message : "Failed to update message"
      toast.error(message)
    },
  })
}

export const useChatMessages = (conversationId: string | null) => {
  const messagesQuery = useMessages(conversationId)
  const sendMessageMutation = useSendMessage()
  const updateMessageMutation = useUpdateMessage()

  return {
    messages: messagesQuery.data ?? [],
    isLoadingMessages: messagesQuery.isLoading,
    messagesError: messagesQuery.error,
    isSendingMessage: sendMessageMutation.isPending,
    isUpdatingMessage: updateMessageMutation.isPending,
    sendMessage: sendMessageMutation.mutate,
    updateMessage: updateMessageMutation.mutate,
    sendMessageError: sendMessageMutation.error,
  }
}
