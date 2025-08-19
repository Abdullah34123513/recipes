import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RecipeImport {
  url?: string
  title: string
  thumbnail_image?: string
  description?: string
  author?: string
  yield?: string
  prep_time?: string
  cook_time?: string
  tags?: string[]
  ingredients: string[]
  instructions: string[]
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const recipes = await request.json()
    
    if (!Array.isArray(recipes)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      )
    }

    const importedRecipes = []
    
    for (const recipeData of recipes) {
      try {
        // Find or create author
        let author = await db.user.findUnique({
          where: { email: recipeData.author ? `${recipeData.author.toLowerCase().replace(/\s+/g, '.')}@demo.com` : "unknown@demo.com" }
        })

        if (!author) {
          author = await db.user.create({
            data: {
              email: recipeData.author ? `${recipeData.author.toLowerCase().replace(/\s+/g, '.')}@demo.com` : "unknown@demo.com",
              name: recipeData.author || "Unknown Author",
              role: "USER"
            }
          })
        }

        // Parse prep time - handle "N/A" and other formats
        let prepTime = 30 // default
        if (recipeData.prep_time && recipeData.prep_time !== "N/A") {
          const timeMatch = recipeData.prep_time.match(/(\d+)/)
          if (timeMatch) {
            prepTime = parseInt(timeMatch[1])
          }
        }

        // Parse serving size from yield
        let servingSize = 4 // default
        if (recipeData.yield) {
          const yieldMatch = recipeData.yield.match(/(\d+(?:\.\d+)?)/)
          if (yieldMatch) {
            servingSize = Math.round(parseFloat(yieldMatch[1]))
          }
        }

        // Create recipe
        const recipe = await db.recipe.create({
          data: {
            title: recipeData.title,
            ingredients: JSON.stringify(recipeData.ingredients),
            steps: JSON.stringify(recipeData.instructions),
            image: recipeData.thumbnail_image || null,
            prepTime,
            servingSize,
            status: "PUBLISHED", // Import as published since they're from external source
            authorId: author.id,
            publishedAt: new Date()
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

        importedRecipes.push(recipe)
      } catch (error) {
        console.error("Error importing recipe:", error)
        // Continue with other recipes even if one fails
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedRecipes.length} recipes`,
      imported: importedRecipes.length,
      total: recipes.length
    })
  } catch (error) {
    console.error("Failed to import recipes:", error)
    return NextResponse.json(
      { error: "Failed to import recipes" },
      { status: 500 }
    )
  }
}