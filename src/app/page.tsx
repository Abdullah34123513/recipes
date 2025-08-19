"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users } from "lucide-react"
import Link from "next/link"

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

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes")
      if (response.ok) {
        const data = await response.json()
        setRecipes(data)
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading recipes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recipe Website
          </h1>
          <p className="text-xl text-gray-600">
            Discover and share amazing recipes
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No recipes yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to share a delicious recipe!
            </p>
            <Link href="/auth/signin">
              <Button>Sign In to Submit Recipe</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                    <Badge variant="secondary">
                      {recipe.status === "PUBLISHED" ? "Published" : recipe.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    By {recipe.author.name || recipe.author.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prepTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servingSize} servings
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ingredients:</h4>
                    <div className="text-sm text-gray-600">
                      {JSON.parse(recipe.ingredients).slice(0, 3).join(", ")}
                      {JSON.parse(recipe.ingredients).length > 3 && "..."}
                    </div>
                  </div>
                  
                  <Link href={`/recipe/${recipe.id}`}>
                    <Button className="w-full">View Recipe</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}