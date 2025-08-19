"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChefHat, Utensils } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="nav-gradient shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <Link href="/" className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Recipes</span>
              <Utensils className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/submit-recipe">
                  <Button className="btn-secondary">
                    Submit Recipe
                  </Button>
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button className="btn-secondary">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Avatar className="h-8 w-8 ring-2 ring-white/50">
                    <AvatarFallback className="bg-white/20 text-white font-bold">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white font-medium">
                    {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button className="btn-primary">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}