import { NextResponse } from "next/server"
import { getDataSource } from "@/database/data-source"
import { Project } from "@/database/entities/project.entity"
import { getUserFromHeaders } from "@/lib/api-utils"

// GET /api/projects/[id] - Get a single project with details
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
    const projectRepository = dataSource.getRepository(Project)

    const project = await projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.conversations', 'conversation')
      .where('project.id = :id', { id })
      .andWhere('project.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .orderBy('conversation.updated_at', 'DESC')
      .getOne()

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      displayName: project.display_name,
      description: project.description,
      customInstructions: project.custom_instructions,
      isStarred: project.is_starred,
      isArchived: project.is_archived,
      conversations: project.conversations?.map(conv => ({
        id: conv.id,
        title: conv.title,
        isStarred: conv.is_starred,
        isArchived: conv.is_archived,
        updatedAt: conv.updated_at,
      })) || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update project
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
    const { name, displayName, description, customInstructions, isStarred, isArchived } = body

    const dataSource = await getDataSource()
    const projectRepository = dataSource.getRepository(Project)

    // Find project owned by user
    const project = await projectRepository
      .createQueryBuilder('project')
      .where('project.id = :id', { id })
      .andWhere('project.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .getOne()

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check for name conflicts if name is being changed
    if (name && name !== project.name) {
      const existingProject = await projectRepository.findOne({
        where: {
          user_id: project.user_id,
          name,
        },
      })

      if (existingProject) {
        return NextResponse.json(
          { error: "Project with this name already exists" },
          { status: 409 }
        )
      }
    }

    // Update fields if provided
    if (name !== undefined) project.name = name
    if (displayName !== undefined) project.display_name = displayName
    if (description !== undefined) project.description = description
    if (customInstructions !== undefined) project.custom_instructions = customInstructions
    if (isStarred !== undefined) project.is_starred = isStarred
    if (isArchived !== undefined) project.is_archived = isArchived

    await projectRepository.save(project)

    return NextResponse.json({
      id: project.id,
      name: project.name,
      displayName: project.display_name,
      description: project.description,
      customInstructions: project.custom_instructions,
      isStarred: project.is_starred,
      isArchived: project.is_archived,
      updatedAt: project.updated_at,
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
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
    const projectRepository = dataSource.getRepository(Project)

    // Find project owned by user
    const project = await projectRepository
      .createQueryBuilder('project')
      .where('project.id = :id', { id })
      .andWhere('project.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .getOne()

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Delete project (conversations will have project_id set to null via CASCADE)
    await projectRepository.remove(project)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
