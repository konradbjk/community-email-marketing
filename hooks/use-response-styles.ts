import { useQuery } from "@tanstack/react-query"
import type { ResponseStyle } from "@/types/profile"

async function fetchResponseStyles(): Promise<ResponseStyle[]> {
  const response = await fetch("/api/response-styles")

  if (!response.ok) {
    throw new Error("Failed to load response styles")
  }

  return response.json()
}

export function useResponseStyles() {
  return useQuery({
    queryKey: ["response-styles"],
    queryFn: fetchResponseStyles,
  })
}
