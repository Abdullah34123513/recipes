import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const recipes = await db.recipe.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Format recipes for export
    const exportData = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      ingredients: JSON.parse(recipe.ingredients),
      steps: JSON.parse(recipe.steps),
      image: recipe.image,
      prepTime: recipe.prepTime,
      servingSize: recipe.servingSize,
      status: recipe.status,
      author: recipe.author,
      createdAt: recipe.createdAt,
      publishedAt: recipe.publishedAt
    }))

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("Failed to export recipes:", error)
    return NextResponse.json(
      { error: "Failed to export recipes" },
      { status: 500 }
    )
  }
}