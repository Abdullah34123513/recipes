import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{recipe.title}</CardTitle>
                <CardDescription>
                  By {recipe.author.name || recipe.author.email}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {recipe.status === "PUBLISHED" ? "Published" : recipe.status}
              </Badge>
            </div>
            
            {recipe.image && (
              <div className="mt-4">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-64 object-cover rounded-lg"
                  width={800}
                  height={256}
                />
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">{recipe.prepTime} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">{recipe.servingSize} servings</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ingredients.map((ingredient: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Instructions</h3>
              <div className="space-y-4">
                {steps.map((step: string, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}