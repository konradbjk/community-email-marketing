import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Types
export interface Project {
  id: string
  name: string
  displayName: string
  description?: string | null
  customInstructions?: string | null
  isStarred: boolean
  isArchived: boolean
  conversationCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectWithConversations extends Project {
  conversations: Array<{
    id: string
    title: string
    isStarred: boolean
    isArchived: boolean
    updatedAt: string
  }>
}

export interface ProjectFilters {
  includeArchived?: boolean
  isStarred?: boolean
}

export interface CreateProjectData {
  name: string
  displayName: string
  description?: string
  customInstructions?: string
}

export interface UpdateProjectData {
  name?: string
  displayName?: string
  description?: string
  customInstructions?: string
  isStarred?: boolean
  isArchived?: boolean
}

// API Functions
async function fetchProjects(filters?: ProjectFilters): Promise<Project[]> {
  const params = new URLSearchParams()

  if (filters?.includeArchived) {
    params.append("include_archived", "true")
  }
  if (filters?.isStarred) {
    params.append("is_starred", "true")
  }

  const url = `/api/projects${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch projects")
  }

  return response.json()
}

async function fetchProject(id: string): Promise<ProjectWithConversations> {
  const response = await fetch(`/api/projects/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch project")
  }

  return response.json()
}

async function createProject(data: CreateProjectData): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create project")
  }

  return response.json()
}

async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update project")
  }

  return response.json()
}

async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete project")
  }
}

// Query Hooks
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
  })
}

export function useProject(id: string | null | undefined) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  })
}

// Mutation Hooks
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      updateProject(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["projects"] })

      // Snapshot previous values
      const previousProjects = queryClient.getQueryData<Project[]>(["projects"])
      const previousProject = queryClient.getQueryData<ProjectWithConversations>(["projects", id])

      // Optimistically update projects list
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previousProjects.map((proj) =>
            proj.id === id ? { ...proj, ...data } : proj
          )
        )
      }

      // Optimistically update single project
      if (previousProject) {
        queryClient.setQueryData<ProjectWithConversations>(
          ["projects", id],
          { ...previousProject, ...data }
        )
      }

      return { previousProjects, previousProject }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects)
      }
      if (context?.previousProject) {
        queryClient.setQueryData(["projects", id], context.previousProject)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["projects"] })

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(["projects"])

      // Optimistically remove from list
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previousProjects.filter((proj) => proj.id !== id)
        )
      }

      return { previousProjects }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// Convenience hooks for common operations
export function useToggleStarProject() {
  const updateMutation = useUpdateProject()

  return (id: string, currentStarred: boolean) => {
    return updateMutation.mutate({
      id,
      data: { isStarred: !currentStarred },
    })
  }
}

export function useArchiveProject() {
  const updateMutation = useUpdateProject()

  return (id: string, currentArchived: boolean) => {
    return updateMutation.mutate({
      id,
      data: { isArchived: !currentArchived },
    })
  }
}
