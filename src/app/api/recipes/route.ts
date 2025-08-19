import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const [recipes, total] = await Promise.all([
      db.recipe.findMany({
        where: {
          status: "PUBLISHED"
        },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          publishedAt: "desc"
        },
        skip: offset,
        take: limit
      }),
      db.recipe.count({
        where: {
          status: "PUBLISHED"
        }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      recipes,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecipes: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error("Failed to fetch recipes:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, ingredients, steps, prepTime, servingSize, image, authorId } = body

    const recipe = await db.recipe.create({
      data: {
        title,
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(steps),
        prepTime,
        servingSize,
        image,
        authorId,
        status: "PENDING"
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Failed to create recipe:", error)
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    )
  }
}