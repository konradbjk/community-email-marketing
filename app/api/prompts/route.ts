import { NextResponse } from "next/server"
import { getDataSource } from "@/database/data-source"
import { Prompt } from "@/database/entities/prompt.entity"
import { User } from "@/database/entities/user.entity"
import { getUserFromHeaders } from "@/lib/api-utils"

// GET /api/prompts - List prompts (personal and shared)
export async function GET(request: Request) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'suggestion' or 'final'
    const onlyStarred = searchParams.get('starred') === 'true'

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

    // Build query - get personal prompts and shared prompts
    const queryBuilder = promptRepository
      .createQueryBuilder('prompt')
      .leftJoinAndSelect('prompt.user', 'user')
      .where('(prompt.user_id = :userId OR prompt.is_personal = false)', {
        userId: dbUser.id,
      })
      .orderBy('prompt.updated_at', 'DESC')

    // Filter by type
    if (type) {
      queryBuilder.andWhere('prompt.type = :type', { type })
    }

    // Filter by starred (only for personal prompts)
    if (onlyStarred) {
      queryBuilder.andWhere('prompt.is_starred = :isStarred', { isStarred: true })
      queryBuilder.andWhere('prompt.user_id = :userId', { userId: dbUser.id })
    }

    const prompts = await queryBuilder.getMany()

    const formattedPrompts = prompts.map(prompt => ({
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
    }))

    return NextResponse.json(formattedPrompts)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    )
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: Request) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, type, forkedFromId } = body

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "Title, content, and type are required" },
        { status: 400 }
      )
    }

    if (!['suggestion', 'final'].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'suggestion' or 'final'" },
        { status: 400 }
      )
    }

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

    // Create prompt (always personal by default)
    const prompt = promptRepository.create({
      user_id: dbUser.id,
      title,
      content,
      type,
      is_personal: true,
      is_starred: false,
      forked_from_id: forkedFromId || null,
    })

    await promptRepository.save(prompt)

    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      type: prompt.type,
      isPersonal: prompt.is_personal,
      isStarred: prompt.is_starred,
      forkedFromId: prompt.forked_from_id,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    )
  }
}
