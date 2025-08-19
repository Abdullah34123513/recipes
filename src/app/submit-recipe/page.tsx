"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ChefHat, Plus, X, Clock, Users, Image } from "lucide-react"

interface Ingredient {
  id: string
  text: string
}

interface Step {
  id: string
  text: string
}

export default function SubmitRecipe() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    prepTime: "",
    servingSize: "",
    image: ""
  })
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: "1", text: "" }])
  const [steps, setSteps] = useState<Step[]>([{ id: "1", text: "" }])

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), text: "" }])
  }

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id))
  }

  const updateIngredient = (id: string, text: string) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, text } : ing))
  }

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), text: "" }])
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id))
  }

  const updateStep = (id: string, text: string) => {
    setSteps(steps.map(step => step.id === id ? { ...step, text } : step))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          ingredients: ingredients.filter(ing => ing.text.trim()).map(ing => ing.text),
          steps: steps.filter(step => step.text.trim()).map(step => step.text),
          prepTime: parseInt(formData.prepTime),
          servingSize: parseInt(formData.servingSize),
          image: formData.image || null,
          authorId: session.user.id
        })
      })

      if (response.ok) {
        toast.success("Recipe submitted successfully! It will be reviewed by an admin.")
        router.push("/")
      } else {
        toast.error("Failed to submit recipe")
      }
    } catch (error) {
      console.error("Error submitting recipe:", error)
      toast.error("Failed to submit recipe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-full">
              <ChefHat className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Submit Your Recipe</h1>
          <p className="text-xl text-gray-600">Share your culinary creation with our community</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
            <CardTitle className="text-2xl flex items-center space-x-3">
              <ChefHat className="h-6 w-6" />
              <span>Recipe Details</span>
            </CardTitle>
            <CardDescription className="text-orange-100">
              Fill in the details to share your amazing recipe
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Basic Information</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-700 font-medium">Recipe Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Enter your recipe name..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime" className="text-gray-700 font-medium flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>Prep Time (minutes)</span>
                      </Label>
                      <Input
                        id="prepTime"
                        type="number"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                        required
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servingSize" className="text-gray-700 font-medium flex items-center space-x-2">
                        <Users className="h-4 w-4 text-red-500" />
                        <span>Serving Size</span>
                      </Label>
                      <Input
                        id="servingSize"
                        type="number"
                        value={formData.servingSize}
                        onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                        required
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="4"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-gray-700 font-medium flex items-center space-x-2">
                        <Image className="h-4 w-4 text-pink-500" />
                        <span>Image URL (optional)</span>
                      </Label>
                      <Input
                        id="image"
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Ingredients</span>
                  </h3>
                  <Button type="button" onClick={addIngredient} className="btn-secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder={`Ingredient ${index + 1}`}
                          value={ingredient.text}
                          onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                          className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      {ingredients.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Cooking Instructions</span>
                  </h3>
                  <Button type="button" onClick={addStep} className="btn-secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-700 font-medium">Step {index + 1}</Label>
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeStep(step.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        placeholder={`Describe step ${index + 1}...`}
                        value={step.text}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                        rows={3}
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  className="btn-primary text-lg px-12 py-4"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-5 w-5" />
                      <span>Submit Recipe</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}