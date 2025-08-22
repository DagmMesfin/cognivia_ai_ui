// Test script to create a user in the Cognivia API
// TODO: Move to environment variables for production
const API_BASE_URL = process.env.COGNIVIA_API_BASE_URL

async function createUser() {
  try {
    console.log("Creating user Dagmawi Ayenew...")

    const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "ayenewdagmawi@gmail.com",
        password: "12345678",
        name: "Dagmawi Ayenew",
      }),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("Raw response:", responseText)

    if (!response.ok) {
      console.error("Registration failed with status:", response.status)
      try {
        const errorData = JSON.parse(responseText)
        console.error("Error details:", errorData)
      } catch (e) {
        console.error("Could not parse error response as JSON")
      }
      return
    }

    const result = JSON.parse(responseText)
    console.log("✅ User created successfully!")
    console.log("User details:", result)

    // Now try to login
    console.log("\n🔐 Testing login...")
    const loginResponse = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "ayenewdagmawi@gmail.com",
        password: "12345678",
      }),
    })

    const loginResult = await loginResponse.json()

    if (loginResponse.ok) {
      console.log("✅ Login successful!")
      console.log("JWT Token:", loginResult.token.substring(0, 50) + "...")
      console.log("User:", loginResult.user)
    } else {
      console.error("❌ Login failed:", loginResult)
    }
  } catch (error) {
    console.error("❌ Network error:", error.message)
    console.error("This could be due to:")
    console.error("1. CORS issues")
    console.error("2. API server is down")
    console.error("3. Network connectivity problems")
    console.error("4. SSL/TLS certificate issues")
  }
}

// Test API connectivity first
async function testAPIConnectivity() {
  try {
    console.log("🔍 Testing API connectivity...")
    const response = await fetch(`${API_BASE_URL}/api/v1/users/507f1f77bcf86cd799439011`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("API connectivity test - Status:", response.status)

    if (response.status === 404) {
      console.log("✅ API is reachable (404 is expected for non-existent user)")
    } else {
      console.log("Response:", await response.text())
    }
  } catch (error) {
    console.error("❌ API connectivity test failed:", error.message)
  }
}

// Run tests
async function runTests() {
  await testAPIConnectivity()
  console.log("\n" + "=".repeat(50) + "\n")
  await createUser()
}

runTests()
