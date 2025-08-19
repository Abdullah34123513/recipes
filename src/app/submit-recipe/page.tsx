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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Recipe</CardTitle>
            <CardDescription>
              Share your delicious recipe with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input
                    id="servingSize"
                    type="number"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ingredients</Label>
                  <Button type="button" variant="outline" onClick={addIngredient}>
                    Add Ingredient
                  </Button>
                </div>
                {ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex gap-2">
                    <Input
                      placeholder={`Ingredient ${index + 1}`}
                      value={ingredient.text}
                      onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                    />
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeIngredient(ingredient.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Steps</Label>
                  <Button type="button" variant="outline" onClick={addStep}>
                    Add Step
                  </Button>
                </div>
                {steps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Step {index + 1}</span>
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder={`Describe step ${index + 1}`}
                      value={step.text}
                      onChange={(e) => updateStep(step.id, e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Recipe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}