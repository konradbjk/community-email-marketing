import { NextResponse } from "next/server"
import { getDataSource } from "@/database/data-source"
import { Conversation } from "@/database/entities/conversation.entity"
import { Message } from "@/database/entities/message.entity"
import { User } from "@/database/entities/user.entity"
import { getUserFromHeaders } from "@/lib/api-utils"

// GET /api/conversations - List all conversations for the authenticated user
export async function GET(request: Request) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dataSource = await getDataSource()
    const conversationRepository = dataSource.getRepository(Conversation)

    // Get URL params for filtering
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('include_archived') === 'true'
    const projectId = searchParams.get('project_id')

    // Build query
    const queryBuilder = conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('conversation.project', 'project')
      .where('conversation.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .orderBy('conversation.updated_at', 'DESC')

    // Filter by archived status
    if (!includeArchived) {
      queryBuilder.andWhere('conversation.is_archived = :isArchived', { isArchived: false })
    }

    // Filter by project
    if (projectId) {
      queryBuilder.andWhere('conversation.project_id = :projectId', { projectId })
    }

    const conversations = await queryBuilder.getMany()

    // Format response
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      isStarred: conv.is_starred,
      isArchived: conv.is_archived,
      projectId: conv.project_id,
      projectName: conv.project?.display_name,
      messageCount: conv.messages?.length || 0,
      lastMessage: conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 100),
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    }))

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: Request) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, projectId, initialMessage } = body

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const conversationRepository = dataSource.getRepository(Conversation)
    const messageRepository = dataSource.getRepository(Message)
    const userRepository = dataSource.getRepository(User)

    // Get user ID
    const dbUser = await userRepository.findOne({
      where: { merck_id: user.merck_id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create conversation
    const conversation = conversationRepository.create({
      user_id: dbUser.id,
      project_id: projectId || null,
      title,
      is_starred: false,
      is_archived: false,
    })

    await conversationRepository.save(conversation)

    // Add initial message if provided
    if (initialMessage) {
      const message = messageRepository.create({
        conversation_id: conversation.id,
        role: 'user',
        content: initialMessage,
      })
      await messageRepository.save(message)
    }

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      isStarred: conversation.is_starred,
      isArchived: conversation.is_archived,
      projectId: conversation.project_id,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
