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

    const { recipeId } = await request.json()

    if (!recipeId) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      )
    }

    // Check if user already liked this recipe
    const existingLike = await db.like.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId
        }
      }
    })

    if (existingLike) {
      // Unlike the recipe
      await db.like.delete({
        where: {
          id: existingLike.id
        }
      })

      return NextResponse.json({
        message: "Recipe unliked successfully",
        liked: false
      })
    } else {
      // Like the recipe
      await db.like.create({
        data: {
          userId: session.user.id,
          recipeId
        }
      })

      return NextResponse.json({
        message: "Recipe liked successfully",
        liked: true
      })
    }
  } catch (error) {
    console.error("Like error:", error)
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

    // Get like count for the recipe
    const likeCount = await db.like.count({
      where: {
        recipeId
      }
    })

    // Check if current user liked this recipe (if authenticated)
    let userLiked = false
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id) {
      const userLike = await db.like.findUnique({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId
          }
        }
      })
      userLiked = !!userLike
    }

    return NextResponse.json({
      likeCount,
      userLiked
    })
  } catch (error) {
    console.error("Get likes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}