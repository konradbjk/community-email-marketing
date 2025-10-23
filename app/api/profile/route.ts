import { NextResponse } from "next/server"
import type { UserProfile, UpdateProfileData } from "@/types/profile"
import { getDataSource } from "@/database/data-source"
import { User } from "@/database/entities/user.entity"
import { UserProfile as UserProfileEntity } from "@/database/entities/user-profile.entity"

// GET /api/profile - Fetch user profile
export async function GET(request: Request) {
  // User info is validated and passed via headers by middleware
  const merckId = request.headers.get('x-user-merck-id')

  if (!merckId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)

    // Find user with profile relation
    const user = await userRepository.findOne({
      where: { merck_id: merckId },
      relations: ['profile'],
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Merge immutable session data with editable preferences from database
    const profile: UserProfile = {
      // Immutable (from database)
      merck_id: user.merck_id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      image: user.image,
      // Editable (from database)
      role: user.profile?.role,
      department: user.profile?.department,
      region: user.profile?.region,
      roleDescription: user.profile?.role_description,
      aiResponseStyleId: user.profile?.ai_response_style_id,
      customResponseStyle: user.profile?.custom_response_style,
      customInstructions: user.profile?.custom_instructions,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Update user profile preferences
export async function PATCH(request: Request) {
  // User info is validated and passed via headers by middleware
  const merckId = request.headers.get('x-user-merck-id')

  if (!merckId) {
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

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const profileRepository = dataSource.getRepository(UserProfileEntity)

    // Find user with profile relation
    const user = await userRepository.findOne({
      where: { merck_id: merckId },
      relations: ['profile'],
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update or create profile
    if (user.profile) {
      // Update existing profile
      if (updates.role !== undefined) user.profile.role = updates.role
      if (updates.department !== undefined) user.profile.department = updates.department
      if (updates.region !== undefined) user.profile.region = updates.region
      if (updates.roleDescription !== undefined) user.profile.role_description = updates.roleDescription
      if (updates.aiResponseStyleId !== undefined) user.profile.ai_response_style_id = updates.aiResponseStyleId
      if (updates.customResponseStyle !== undefined) user.profile.custom_response_style = updates.customResponseStyle
      if (updates.customInstructions !== undefined) user.profile.custom_instructions = updates.customInstructions

      await profileRepository.save(user.profile)
    } else {
      // Create new profile
      const newProfile = profileRepository.create({
        user_id: user.id,
        role: updates.role,
        department: updates.department,
        region: updates.region,
        role_description: updates.roleDescription,
        ai_response_style_id: updates.aiResponseStyleId,
        custom_response_style: updates.customResponseStyle,
        custom_instructions: updates.customInstructions,
      })
      await profileRepository.save(newProfile)
      user.profile = newProfile
    }

    // Return updated profile
    const updatedProfile: UserProfile = {
      // Immutable (from session)
      merck_id: user.merck_id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      image: user.image,
      // Editable (from database)
      role: user.profile.role,
      department: user.profile.department,
      region: user.profile.region,
      roleDescription: user.profile.role_description,
      aiResponseStyleId: user.profile.ai_response_style_id,
      customResponseStyle: user.profile.custom_response_style,
      customInstructions: user.profile.custom_instructions,
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
