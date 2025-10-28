import { NextResponse } from "next/server"
import { getDataSource } from "@/database/data-source"
import { Project } from "@/database/entities/project.entity"
import { User } from "@/database/entities/user.entity"
import { getUserFromHeaders } from "@/lib/api-utils"

// GET /api/projects - List all projects for the authenticated user
export async function GET(request: Request) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dataSource = await getDataSource()
    const projectRepository = dataSource.getRepository(Project)

    // Get URL params for filtering
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('include_archived') === 'true'

    // Build query
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.conversations', 'conversation')
      .where('project.user_id = (SELECT id FROM users WHERE merck_id = :merckId)', {
        merckId: user.merck_id,
      })
      .orderBy('project.updated_at', 'DESC')

    // Filter by archived status
    if (!includeArchived) {
      queryBuilder.andWhere('project.is_archived = :isArchived', { isArchived: false })
    }

    const projects = await queryBuilder.getMany()

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      displayName: project.display_name,
      description: project.description,
      customInstructions: project.custom_instructions,
      isStarred: project.is_starred,
      isArchived: project.is_archived,
      conversationCount: project.conversations?.length || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  const user = getUserFromHeaders(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, displayName, description, customInstructions } = body

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and displayName are required" },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const projectRepository = dataSource.getRepository(Project)
    const userRepository = dataSource.getRepository(User)

    // Get user ID
    const dbUser = await userRepository.findOne({
      where: { merck_id: user.merck_id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if project name already exists for this user
    const existingProject = await projectRepository.findOne({
      where: {
        user_id: dbUser.id,
        name,
      },
    })

    if (existingProject) {
      return NextResponse.json(
        { error: "Project with this name already exists" },
        { status: 409 }
      )
    }

    // Create project
    const project = projectRepository.create({
      user_id: dbUser.id,
      name,
      display_name: displayName,
      description: description || null,
      custom_instructions: customInstructions || null,
      is_starred: false,
    })

    await projectRepository.save(project)

    return NextResponse.json({
      id: project.id,
      name: project.name,
      displayName: project.display_name,
      description: project.description,
      customInstructions: project.custom_instructions,
      isStarred: project.is_starred,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
