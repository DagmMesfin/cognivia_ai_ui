const API_BASE_URL = "https://cognivia-api.onrender.com"
const USE_PROXY = true // Set to true to use proxy, false for direct API calls

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

class AuthAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = USE_PROXY
      ? endpoint // Use proxy routes (relative URLs)
      : `${API_BASE_URL}${endpoint}` // Direct API calls

    console.log(`Making request to: ${url}`)
    console.log(`Method: ${options.method || "GET"}`)
    console.log(`Using proxy: ${USE_PROXY}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...(USE_PROXY ? {} : { mode: "cors" }), // Only set CORS mode for direct calls
      })

      console.log(`Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.log(`Error response:`, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`Success response:`, data)
      return data
    } catch (error) {
      console.error("API Request Error:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Network error: Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async register(data: RegisterRequest): Promise<{ message: string; user: User }> {
    const endpoint = USE_PROXY ? "/api/auth/register" : "/api/v1/users/register"
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const endpoint = USE_PROXY ? "/api/auth/login" : "/api/v1/users/login"
    const result = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })

    // Store token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cognivia_token", result.token)
      localStorage.setItem("cognivia_user", JSON.stringify(result.user))
    }

    return result
  }

  async getUserById(id: string): Promise<User> {
    const endpoint = USE_PROXY ? `/api/users/${id}` : `/api/v1/users/${id}`
    return this.makeRequest(endpoint)
  }

  async updateUser(id: string, data: Partial<RegisterRequest>): Promise<{ message: string }> {
    const endpoint = USE_PROXY ? `/api/users/${id}` : `/api/v1/users/${id}`
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const endpoint = USE_PROXY ? `/api/users/${id}` : `/api/v1/users/${id}`
    return this.makeRequest(endpoint, {
      method: "DELETE",
    })
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cognivia_token")
      localStorage.removeItem("cognivia_user")
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cognivia_token")
    }
    return null
  }

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("cognivia_user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Test connection method
  async testConnection(): Promise<{ success: boolean; method: string; error?: string }> {
    try {
      // Try proxy first
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
      })
      return { success: true, method: "proxy" }
    } catch (proxyError) {
      try {
        // Try direct API
        await fetch(`${API_BASE_URL}/api/v1/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@test.com", password: "test" }),
          mode: "cors",
        })
        return { success: true, method: "direct" }
      } catch (directError) {
        return {
          success: false,
          method: "none",
          error: `Proxy: ${proxyError.message}, Direct: ${directError.message}`,
        }
      }
    }
  }
}

export const authAPI = new AuthAPI()
