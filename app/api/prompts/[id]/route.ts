import { NextResponse } from "next/server"
import { getDataSource } from "@/database/data-source"
import { Prompt } from "@/database/entities/prompt.entity"
import { User } from "@/database/entities/user.entity"
import { getUserFromHeaders } from "@/lib/api-utils"

// GET /api/prompts/[id] - Get a single prompt
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const dataSource = await getDataSource()
    const promptRepository = dataSource.getRepository(Prompt)
    const userRepository = dataSource.getRepository(User)

    // Get user ID
    const dbUser = await userRepository.findOne({
      where: { merck_id: user.merck_id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get prompt - must be owned by user or be shared
    const prompt = await promptRepository
      .createQueryBuilder('prompt')
      .leftJoinAndSelect('prompt.user', 'user')
      .where('prompt.id = :id', { id })
      .andWhere('(prompt.user_id = :userId OR prompt.is_personal = false)', {
        userId: dbUser.id,
      })
      .getOne()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      type: prompt.type,
      isPersonal: prompt.is_personal,
      isStarred: prompt.is_starred,
      langfuseId: prompt.langfuse_id,
      forkedFromId: prompt.forked_from_id,
      authorName: prompt.user ? `${prompt.user.name} ${prompt.user.surname}` : null,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at,
    })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    )
  }
}

// PATCH /api/prompts/[id] - Update a prompt (only if owned by user)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { title, content, type, isStarred } = body

    const dataSource = await getDataSource()
    const promptRepository = dataSource.getRepository(Prompt)
    const userRepository = dataSource.getRepository(User)

    // Get user ID
    const dbUser = await userRepository.findOne({
      where: { merck_id: user.merck_id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find prompt owned by user
    const prompt = await promptRepository.findOne({
      where: {
        id,
        user_id: dbUser.id,
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found or not owned by user" },
        { status: 404 }
      )
    }

    // Update fields if provided
    if (title !== undefined) prompt.title = title
    if (content !== undefined) prompt.content = content
    if (type !== undefined) {
      if (!['suggestion', 'final'].includes(type)) {
        return NextResponse.json(
          { error: "Type must be 'suggestion' or 'final'" },
          { status: 400 }
        )
      }
      prompt.type = type
    }
    if (isStarred !== undefined) prompt.is_starred = isStarred

    await promptRepository.save(prompt)

    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      type: prompt.type,
      isPersonal: prompt.is_personal,
      isStarred: prompt.is_starred,
      updatedAt: prompt.updated_at,
    })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    )
  }
}

// DELETE /api/prompts/[id] - Delete a prompt (only if owned by user)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const dataSource = await getDataSource()
    const promptRepository = dataSource.getRepository(Prompt)
    const userRepository = dataSource.getRepository(User)

    // Get user ID
    const dbUser = await userRepository.findOne({
      where: { merck_id: user.merck_id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find prompt owned by user
    const prompt = await promptRepository.findOne({
      where: {
        id,
        user_id: dbUser.id,
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found or not owned by user" },
        { status: 404 }
      )
    }

    await promptRepository.remove(prompt)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    )
  }
}
