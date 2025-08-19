import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await db.recipe.findUnique({
      where: {
        id: params.id
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

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Failed to fetch recipe:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, ingredients, steps, prepTime, servingSize, image, status } = body

    const recipe = await db.recipe.update({
      where: {
        id: params.id
      },
      data: {
        title,
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(steps),
        prepTime,
        servingSize,
        image,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null
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
    console.error("Failed to update recipe:", error)
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.recipe.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Recipe deleted successfully" })
  } catch (error) {
    console.error("Failed to delete recipe:", error)
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    )
  }
}