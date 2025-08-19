"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star, ChefHat, Utensils, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delicious recipes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-200">
              Recipe Website
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              Discover and share amazing recipes from our community of passionate cooks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button className="btn-primary text-lg px-8 py-4">
                  Start Cooking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#recipes">
                <Button className="btn-secondary text-lg px-8 py-4">
                  Browse Recipes
                  <Utensils className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-500 mb-2">{recipes.length}</div>
              <div className="text-gray-600">Delicious Recipes</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
              <div className="text-3xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
              <div className="text-3xl font-bold text-pink-500 mb-2">∞</div>
              <div className="text-gray-600">Culinary Inspiration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div id="recipes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Recipes</h2>
          <p className="text-xl text-gray-600">Handpicked favorites from our community</p>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <ChefHat className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No recipes yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share a delicious recipe!</p>
              <Link href="/auth/signin">
                <Button className="btn-primary">
                  Share Your Recipe
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card group">
                {/* Recipe Image Header */}
                <div className="recipe-card-header">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {recipe.status === "PUBLISHED" ? "Published" : recipe.status}
                    </Badge>
                    <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                      <Star className="h-4 w-4 text-yellow-300 fill-current" />
                      <span className="text-xs text-white">4.8</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white mb-2">{recipe.title}</CardTitle>
                  <CardDescription className="text-orange-100">
                    By {recipe.author.name || recipe.author.email}
                  </CardDescription>
                </div>

                {/* Recipe Image */}
                <div className="relative h-48 overflow-hidden">
                  {recipe.image ? (
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-orange-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                </div>

                {/* Recipe Content */}
                <div className="recipe-content">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{recipe.prepTime} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{recipe.servingSize} servings</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(recipe.ingredients).slice(0, 3).map((ingredient: string, index: number) => (
                        <span key={index} className="ingredient-badge">
                          {ingredient}
                        </span>
                      ))}
                      {JSON.parse(recipe.ingredients).length > 3 && (
                        <span className="ingredient-badge">
                          +{JSON.parse(recipe.ingredients).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link href={`/recipe/${recipe.id}`}>
                    <Button className="btn-primary w-full">
                      View Recipe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Ready to Start Cooking?</h3>
            <p className="text-gray-400 mb-6">Join our community and share your culinary creations</p>
            <Link href="/auth/signin">
              <Button className="btn-primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}