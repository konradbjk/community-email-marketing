import { NextResponse } from "next/server"
import { getDataSource } from "@/database/data-source"
import { Conversation } from "@/database/entities/conversation.entity"
import { Message } from "@/database/entities/message.entity"
import { User } from "@/database/entities/user.entity"
import { getUserFromHeaders } from "@/lib/api-utils"

// GET /api/conversations/[id] - Get a single conversation with messages
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
    const conversationRepository = dataSource.getRepository(Conversation)

    const conversation = await conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('conversation.project', 'project')
      .where('conversation.id = :id', { id })
      .andWhere('conversation.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .orderBy('message.created_at', 'ASC')
      .getOne()

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      isStarred: conversation.is_starred,
      isArchived: conversation.is_archived,
      projectId: conversation.project_id,
      projectName: conversation.project?.display_name,
      messages: conversation.messages?.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
        toolInvocations: msg.tool_invocations,
        attachments: msg.attachments,
      })) || [],
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}

// PATCH /api/conversations/[id] - Update conversation (title, starred, archived)
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
    const { title, isStarred, isArchived } = body

    const dataSource = await getDataSource()
    const conversationRepository = dataSource.getRepository(Conversation)

    // Find conversation owned by user
    const conversation = await conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.id = :id', { id })
      .andWhere('conversation.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .getOne()

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Update fields if provided
    if (title !== undefined) conversation.title = title
    if (isStarred !== undefined) conversation.is_starred = isStarred
    if (isArchived !== undefined) conversation.is_archived = isArchived

    await conversationRepository.save(conversation)

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      isStarred: conversation.is_starred,
      isArchived: conversation.is_archived,
      updatedAt: conversation.updated_at,
    })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    )
  }
}

// DELETE /api/conversations/[id] - Delete a conversation
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
    const conversationRepository = dataSource.getRepository(Conversation)

    // Find conversation owned by user
    const conversation = await conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.id = :id', { id })
      .andWhere('conversation.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .getOne()

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Delete conversation (cascade will delete messages)
    await conversationRepository.remove(conversation)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}
