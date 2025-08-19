import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { recipeId, content } = await request.json()

    if (!recipeId || !content) {
      return NextResponse.json(
        { error: "Recipe ID and content are required" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      )
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        userId: session.user.id,
        recipeId,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Comment created successfully",
      comment
    })
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get("recipeId")

    if (!recipeId) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      )
    }

    // Get comments for the recipe
    const comments = await db.comment.findMany({
      where: {
        recipeId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      comments
    })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}