import type { Metadata } from "next"
import Link from "next/link"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In - Cognivia",
  description: "Sign in to your Cognivia account",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - blue Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 p-12 text-white">
        <div className="flex flex-col justify-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold">Cognivia</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight">Welcome Back to Your Learning Journey</h1>

          <p className="mb-12 text-lg text-blue-100">
            Continue your studies with AI-powered assistance and smart learning tools.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-200"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>AI-powered study assistance</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-200"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Smart note-taking and summarization</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-200"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Personalized quiz generation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">Sign in to your account to continue learning.</p>
          </div>

          <SignInForm />

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link href="/sign-up" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
