import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Get the count of recipes before deletion for feedback
    const recipeCount = await db.recipe.count()
    
    if (recipeCount === 0) {
      return NextResponse.json({
        message: "No recipes to wipe",
        wipedCount: 0
      })
    }

    // Delete all recipes
    const deleteResult = await db.recipe.deleteMany({})

    return NextResponse.json({
      message: `Successfully wiped ${deleteResult.count} recipes from the database`,
      wipedCount: deleteResult.count,
      previousCount: recipeCount
    })
  } catch (error) {
    console.error("Failed to wipe recipes:", error)
    return NextResponse.json(
      { error: "Failed to wipe recipes" },
      { status: 500 }
    )
  }
}