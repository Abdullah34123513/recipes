import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, ArrowLeft, Star, ChefHat, Utensils } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { db } from "@/lib/db"

interface Recipe {
  id: string
  title: string
  ingredients: string
  steps: string
  image?: string
  prepTime: number
  servingSize: number
  status: string
  publishedAt?: string
  author: {
    name?: string
    email: string
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const recipe = await db.recipe.findUnique({
      where: {
        id
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

    return recipe
  } catch (error) {
    console.error("Failed to fetch recipe:", error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const recipe = await getRecipe(id)
  
  if (!recipe) {
    return {
      title: "Recipe Not Found",
      description: "The requested recipe could not be found."
    }
  }

  const ingredients = JSON.parse(recipe.ingredients)
  const description = `Delicious ${recipe.title} recipe. Ingredients: ${ingredients.slice(0, 3).join(", ")}. Prep time: ${recipe.prepTime} minutes. Serves: ${recipe.servingSize}.`

  return {
    title: `${recipe.title} - Recipe Website`,
    description,
    keywords: [
      recipe.title,
      "recipe",
      "cooking",
      "food",
      ...ingredients.slice(0, 5)
    ],
    openGraph: {
      title: `${recipe.title} - Recipe Website`,
      description,
      images: recipe.image ? [recipe.image] : [],
      type: "article",
      publishedTime: recipe.publishedAt,
      authors: [recipe.author.name || recipe.author.email],
    },
    twitter: {
      card: "summary_large_image",
      title: `${recipe.title} - Recipe Website`,
      description,
      images: recipe.image ? [recipe.image] : [],
    },
  }
}

export default async function RecipeDetail({ params }: PageProps) {
  const { id } = await params
  const recipe = await getRecipe(id)

  if (!recipe) {
    notFound()
  }

  const ingredients = JSON.parse(recipe.ingredients)
  const steps = JSON.parse(recipe.steps)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button className="btn-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Recipe Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recipe Header */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-64 md:h-80">
                {recipe.image ? (
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <ChefHat className="h-24 w-24 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {recipe.status === "PUBLISHED" ? "Published" : recipe.status}
                    </Badge>
                    <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                      <Star className="h-4 w-4 text-yellow-300 fill-current" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
                  <p className="text-orange-100">By {recipe.author.name || recipe.author.email}</p>
                </div>
              </div>
            </div>

            {/* Recipe Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center space-x-3 bg-orange-50 rounded-full px-4 py-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-700">{recipe.prepTime} minutes</span>
                </div>
                <div className="flex items-center space-x-3 bg-red-50 rounded-full px-4 py-2">
                  <Users className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-gray-700">{recipe.servingSize} servings</span>
                </div>
                <div className="flex items-center space-x-3 bg-pink-50 rounded-full px-4 py-2">
                  <Utensils className="h-5 w-5 text-pink-500" />
                  <span className="font-medium text-gray-700">{ingredients.length} ingredients</span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ingredients.map((ingredient: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Utensils className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
              </div>
              <div className="space-y-6">
                {steps.map((step: string, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="step-number flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-full">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{recipe.author.name || recipe.author.email}</p>
                  <p className="text-sm text-gray-600">Passionate Cook</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Save Recipe
                </Button>
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Share Recipe
                </Button>
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Print Recipe
                </Button>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nutrition Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">~350 per serving</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">~15g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">~45g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">~12g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}