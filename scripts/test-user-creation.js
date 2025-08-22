// Comprehensive test script for user creation with multiple approaches

// TODO: Move to environment variables for production
const DIRECT_API_URL = process.env.COGNIVIA_API_BASE_URL
const PROXY_API_URL = "http://localhost:3000/api/proxy" // For local development

async function testDirectAPI() {
  console.log("🔍 Testing Direct API Connection...")
  console.log("URL:", DIRECT_API_URL)

  try {
    const response = await fetch(`${DIRECT_API_URL}/api/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000", // Simulate browser origin
      },
      body: JSON.stringify({
        email: "ayenewdagmawi@gmail.com",
        password: "12345678",
        name: "Dagmawi Ayenew",
      }),
    })

    console.log("Status:", response.status)
    console.log("Headers:", Object.fromEntries(response.headers.entries()))

    const result = await response.text()
    console.log("Response:", result)

    if (response.ok) {
      console.log("✅ Direct API: User created successfully!")
      return JSON.parse(result)
    } else {
      console.log("❌ Direct API: Failed")
      return null
    }
  } catch (error) {
    console.log("❌ Direct API Error:", error.message)
    return null
  }
}

async function testCORSWorkaround() {
  console.log("\n🔧 Testing CORS Workaround...")

  try {
    // Using a CORS proxy service for testing
    const proxyUrl = "https://cors-anywhere.herokuapp.com/"
    const targetUrl = `${DIRECT_API_URL}/api/v1/users/register`

    const response = await fetch(proxyUrl + targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        email: "ayenewdagmawi+cors@gmail.com", // Different email to avoid conflicts
        password: "12345678",
        name: "Dagmawi Ayenew (CORS Test)",
      }),
    })

    const result = await response.text()
    console.log("CORS Proxy Response:", result)

    if (response.ok) {
      console.log("✅ CORS Workaround: User created successfully!")
      return JSON.parse(result)
    } else {
      console.log("❌ CORS Workaround: Failed")
      return null
    }
  } catch (error) {
    console.log("❌ CORS Workaround Error:", error.message)
    return null
  }
}

async function testAPIHealth() {
  console.log("\n🏥 Testing API Health...")

  try {
    // Test if API is responding at all
    const response = await fetch(`${DIRECT_API_URL}/api/v1/users/507f1f77bcf86cd799439011`)
    console.log("Health check status:", response.status)

    if (response.status === 404) {
      console.log("✅ API is healthy (404 expected for non-existent user)")
      return true
    } else if (response.status === 200) {
      console.log("✅ API is healthy (found test user)")
      return true
    } else {
      console.log("⚠️ API returned unexpected status:", response.status)
      return false
    }
  } catch (error) {
    console.log("❌ API Health Check Failed:", error.message)
    return false
  }
}

async function createUserWithRetry() {
  console.log("\n🔄 Creating User with Retry Logic...")

  const userData = {
    email: "ayenewdagmawi@gmail.com",
    password: "12345678",
    name: "Dagmawi Ayenew",
  }

  const attempts = [
    {
      name: "Standard Request",
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      },
    },
    {
      name: "With CORS Headers",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
        body: JSON.stringify(userData),
      },
    },
    {
      name: "Simple Request",
      options: {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(userData),
      },
    },
  ]

  for (const attempt of attempts) {
    try {
      console.log(`\nTrying: ${attempt.name}`)
      const response = await fetch(`${DIRECT_API_URL}/api/v1/users/register`, attempt.options)

      console.log("Status:", response.status)
      const result = await response.text()

      if (response.ok) {
        console.log(`✅ Success with ${attempt.name}!`)
        console.log("User created:", JSON.parse(result))
        return JSON.parse(result)
      } else {
        console.log(`❌ ${attempt.name} failed:`, result)
      }
    } catch (error) {
      console.log(`❌ ${attempt.name} error:`, error.message)
    }
  }

  return null
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting Comprehensive API Tests\n")
  console.log("=" * 60)

  // Test API health first
  const isHealthy = await testAPIHealth()

  if (!isHealthy) {
    console.log("\n❌ API appears to be down. Stopping tests.")
    return
  }

  // Try different approaches
  await testDirectAPI()
  await testCORSWorkaround()
  await createUserWithRetry()

  console.log("\n" + "=" * 60)
  console.log("🏁 Tests completed!")
  console.log("\nIf all tests failed, the issue is likely:")
  console.log("1. CORS policy on the API server")
  console.log("2. API server configuration")
  console.log("3. Network/firewall restrictions")
  console.log("\nRecommended next steps:")
  console.log("1. Use the proxy solution in development")
  console.log("2. Contact API maintainer about CORS")
  console.log("3. Set up local API instance")
}

runAllTests()
