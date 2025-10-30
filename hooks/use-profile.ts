import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserProfile, UpdateProfileData } from "@/types/profile"

// Fetch user profile
async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch("/api/profile")

  if (!response.ok) {
    throw new Error("Failed to fetch profile")
  }

  return response.json()
}

// Update user profile
async function updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  const payload: UpdateProfileData = { ...data }

  if (payload.aiResponseStyleId === 'advanced' || payload.aiResponseStyleId === '') {
    payload.aiResponseStyleId = null
  }

  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update profile")
  }

  return response.json()
}

// Hook to fetch user profile
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  })
}

// Hook to update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(["profile"], data)
    },
  })
}
