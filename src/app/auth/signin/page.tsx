"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push("/")
    } else {
      alert("Invalid credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <ChefHat className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-orange-100">Sign in to access your recipe collection</p>
          </div>

          {/* Sign In Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-gray-900 text-center">Sign In</CardTitle>
              <CardDescription className="text-gray-600 text-center">
                Enter your credentials to access the recipe website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ChefHat className="h-5 w-5 text-orange-500" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ChefHat className="h-5 w-5 text-red-500" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary text-lg py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ChefHat className="h-5 w-5" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center space-x-2">
                  <ChefHat className="h-4 w-4" />
                  <span>Demo Credentials</span>
                </h4>
                <div className="space-y-1 text-sm text-orange-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Admin:</span>
                    <span>admin@demo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">User:</span>
                    <span>user@demo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Password:</span>
                    <span>demo123</span>
                  </div>
                </div>
              </div>

              {/* Additional Links */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    Contact admin
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-orange-100 text-sm">
              © 2024 Recipe Website. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}