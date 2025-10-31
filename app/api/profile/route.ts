import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { UserProfile, UpdateProfileData } from "@/types/profile"

// Mock profile preferences data (same for all users in POC)
const mockPreferences = {
  role: "Senior Marketing Manager",
  department: "Oncology Business Unit",
  region: "EMEA",
  roleDescription:
    "I lead marketing analytics for the Oncology portfolio, focusing on digital channel optimization and customer segmentation strategies. My primary responsibilities include analyzing email campaign performance, field vs digital interaction ratios, and cross-regional benchmarking.",
  aiResponseStyleId: "550e8400-e29b-41d4-a716-446655440001",
  customResponseStyle: "",
  customInstructions:
    "When analyzing data, please focus on actionable insights and include benchmarks against regional averages. I prefer visual representations when discussing trends and always want recommendations prioritized by impact and feasibility.",
}

// GET /api/profile - Fetch user profile
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Merge immutable session data with editable preferences
  const profile: UserProfile = {
    // Immutable (from IDP)
    merck_id: session.user.merck_id,
    name: session.user.name,
    surname: session.user.surname,
    email: session.user.email,
    image: session.user.image,
    // Editable (from database - mocked for POC)
    ...mockPreferences,
  }

  return NextResponse.json(profile)
}

// PATCH /api/profile - Update user profile preferences
export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate that user is not trying to modify immutable fields
    const immutableFields = ["merck_id", "name", "surname", "email", "image"]
    const attemptedImmutableUpdate = immutableFields.some(
      (field) => field in body
    )

    if (attemptedImmutableUpdate) {
      return NextResponse.json(
        {
          error:
            "Cannot modify immutable fields (merck_id, name, surname, email, image). These fields are managed by Merck SSO.",
        },
        { status: 400 }
      )
    }

    // Validate editable fields
    const editableFields = [
      "role",
      "department",
      "region",
      "roleDescription",
      "aiResponseStyleId",
      "customResponseStyle",
      "customInstructions",
    ]

    const updates: UpdateProfileData = {}
    for (const field of editableFields) {
      if (field in body) {
        updates[field as keyof UpdateProfileData] = body[field]
      }
    }

    // In production, save to database here
    // For POC, we just return the updated profile

    // Merge updates with current profile
    const updatedProfile: UserProfile = {
      // Immutable (from session)
      merck_id: session.user.merck_id,
      name: session.user.name,
      surname: session.user.surname,
      email: session.user.email,
      image: session.user.image,
      // Editable (merged with updates)
      ...mockPreferences,
      ...updates,
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
