"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cognivia
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4 text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4 text-foreground">
            How It Works
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4 text-foreground">
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/sign-in" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up" className="hidden sm:block">
            <Button size="sm">Sign Up</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 bg-background border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-sm font-medium px-2 py-1 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium px-2 py-1 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium px-2 py-1 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </Link>
            <div className="flex gap-2 pt-2">
              <Link href="/sign-in" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="flex-1">
                <Button size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
