import { NextResponse } from 'next/server'
import { getDataSource } from '@/database/data-source'
import { ResponseStyle } from '@/database/entities/response-style.entity'

export async function GET() {
  try {
    const dataSource = await getDataSource()
    const repository = dataSource.getRepository(ResponseStyle)

    const styles = await repository.find({
      order: {
        is_default: 'DESC',
        label: 'ASC',
      },
    })

    return NextResponse.json(
      styles.map((style) => ({
        id: style.id,
        label: style.label,
        description: style.description,
        isDefault: style.is_default,
      }))
    )
  } catch (error) {
    console.error('Error fetching response styles:', error)
    return NextResponse.json(
      { error: 'Failed to load response styles' },
      { status: 500 }
    )
  }
}
