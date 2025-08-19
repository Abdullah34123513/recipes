"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Recipes
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/submit-recipe">
                  <Button variant="outline">Submit Recipe</Button>
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline">Admin Panel</Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">
                    {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}