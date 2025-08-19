"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Download, Upload, Eye, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Database } from "lucide-react"

interface Recipe {
  id: string
  title: string
  ingredients: string
  steps: string
  image?: string
  prepTime: number
  servingSize: number
  status: string
  createdAt: string
  author: {
    name?: string
    email: string
  }
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalRecipes: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    ingredients: "",
    steps: "",
    prepTime: "",
    servingSize: "",
    image: "",
    status: ""
  })
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [wipeLoading, setWipeLoading] = useState(false)

  useEffect(() => {
    if (session?.user.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchRecipes(1)
  }, [session, router])

  const fetchRecipes = async (page: number = 1, status: string = statusFilter) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/recipes?page=${page}&limit=20&status=${status}`)
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (recipeId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success("Recipe status updated successfully")
        fetchRecipes(pagination?.currentPage || 1)
      } else {
        toast.error("Failed to update recipe status")
      }
    } catch (error) {
      console.error("Error updating recipe status:", error)
      toast.error("Failed to update recipe status")
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setEditForm({
      title: recipe.title,
      ingredients: JSON.parse(recipe.ingredients).join("\n"),
      steps: JSON.parse(recipe.steps).join("\n"),
      prepTime: recipe.prepTime.toString(),
      servingSize: recipe.servingSize.toString(),
      image: recipe.image || "",
      status: recipe.status
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedRecipe) return

    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editForm.title,
          ingredients: editForm.ingredients.split("\n").filter(i => i.trim()),
          steps: editForm.steps.split("\n").filter(s => s.trim()),
          prepTime: parseInt(editForm.prepTime),
          servingSize: parseInt(editForm.servingSize),
          image: editForm.image || null,
          status: editForm.status
        })
      })

      if (response.ok) {
        toast.success("Recipe updated successfully")
        setIsEditDialogOpen(false)
        fetchRecipes(pagination?.currentPage || 1)
      } else {
        toast.error("Failed to update recipe")
      }
    } catch (error) {
      console.error("Error updating recipe:", error)
      toast.error("Failed to update recipe")
    }
  }

  const handleDelete = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Recipe deleted successfully")
        fetchRecipes(pagination?.currentPage || 1)
      } else {
        toast.error("Failed to delete recipe")
      }
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast.error("Failed to delete recipe")
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/recipes/export")
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "recipes.json"
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Recipes exported successfully")
      }
    } catch (error) {
      console.error("Error exporting recipes:", error)
      toast.error("Failed to export recipes")
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    setImportProgress(0)

    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      })

      const recipes = JSON.parse(content)
      
      // Simulate progress for large imports
      const totalRecipes = recipes.length
      const batchSize = 50
      let processed = 0

      const progressInterval = setInterval(() => {
        processed = Math.min(processed + batchSize, totalRecipes)
        setImportProgress((processed / totalRecipes) * 100)
        
        if (processed >= totalRecipes) {
          clearInterval(progressInterval)
        }
      }, 500)

      const response = await fetch("/api/admin/recipes/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(recipes)
      })

      clearInterval(progressInterval)
      setImportProgress(100)

      if (response.ok) {
        const result = await response.json()
        toast.success(`Import completed: ${result.imported} imported, ${result.failed} failed (${result.successRate}% success rate)`)
        fetchRecipes(1)
      } else {
        toast.error("Failed to import recipes")
      }
    } catch (error) {
      console.error("Error importing recipes:", error)
      toast.error("Failed to import recipes")
    } finally {
      setImportLoading(false)
      setImportProgress(0)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleWipeDatabase = async () => {
    setWipeLoading(true)
    
    try {
      const response = await fetch("/api/admin/recipes/wipe", {
        method: "POST"
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchRecipes(1, statusFilter)
      } else {
        toast.error("Failed to wipe recipe database")
      }
    } catch (error) {
      console.error("Error wiping database:", error)
      toast.error("Failed to wipe recipe database")
    } finally {
      setWipeLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchRecipes(page, statusFilter)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    fetchRecipes(1, status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage recipes and user submissions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" disabled={importLoading}>
                {importLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Import JSON
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={wipeLoading || importLoading}>
                  {wipeLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="mr-2 h-4 w-4" />
                  )}
                  Wipe Database
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Confirm Database Wipe
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all recipes from the database. This action cannot be undone.
                    <br /><br />
                    <strong>Warning:</strong> All recipe data will be lost forever. Make sure you have exported your data if you want to keep it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleWipeDatabase}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {wipeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wiping...
                      </>
                    ) : (
                      "Yes, Wipe All Recipes"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {importLoading && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Importing Recipes</CardTitle>
              <CardDescription>
                Please wait while we process your recipe data...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={importProgress} className="mb-2" />
              <p className="text-sm text-gray-600">
                {importProgress.toFixed(1)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recipe Management</CardTitle>
                <CardDescription>
                  Review and manage all recipe submissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">{recipe.title}</TableCell>
                    <TableCell>{recipe.author.name || recipe.author.email}</TableCell>
                    <TableCell>
                      <Select
                        value={recipe.status}
                        onValueChange={(value) => handleStatusChange(recipe.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/recipe/${recipe.id}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(recipe)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(recipe.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * 20) + 1} - {Math.min(pagination.currentPage * 20, pagination.totalRecipes)} of {pagination.totalRecipes} recipes
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>
              <DialogDescription>
                Make changes to the recipe below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={editForm.prepTime}
                    onChange={(e) => setEditForm({ ...editForm, prepTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input
                    id="servingSize"
                    type="number"
                    value={editForm.servingSize}
                    onChange={(e) => setEditForm({ ...editForm, servingSize: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                <Textarea
                  id="ingredients"
                  value={editForm.ingredients}
                  onChange={(e) => setEditForm({ ...editForm, ingredients: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">Steps (one per line)</Label>
                <Textarea
                  id="steps"
                  value={editForm.steps}
                  onChange={(e) => setEditForm({ ...editForm, steps: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}