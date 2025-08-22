import axios from "axios"

const API_BASE_URL = "https://cognivia-api.onrender.com"
const USE_PROXY = true // Set to true to use proxy, false for direct API calls

export interface Notebook {
  id: string
  user_id: string
  snapnotes_id?: string
  prep_pilot_id?: string
  name: string
  icon?: string
  color?: string
  type?: string
  google_drive_link?: string
  created_at: string
  updated_at: string
}

export interface CreateNotebookRequest {
  name: string
  icon?: string
  color?: string
  type?: string
  google_drive_link?: string
}

export interface Snapnotes {
  id: string
  title: string
  summaryByChapter: Array<{
    chapterTitle: string
    summary: string
    keyPoints: string[]
  }>
  flashcards: Array<{
    chapterTitle: string
    flashcards: Array<{
      "key term": string
      definition: string
    }>
  }>
}

export interface PrepPilot {
  id: string
  notebook_id: string
  chapters: Array<{
    chapterTitle: string
    questions: Array<{
      question: string
      options: {
        A: string
        B: string
        C: string
        D: string
      }
      answer: string
      explanation: string
    }>
  }>
}

export interface CreateSnapnotesRequest {
  notebook_id: string
  title: string
  content?: string
}

export interface CreatePrepPilotRequest {
  notebook_id: string
  chapters: string[]
  difficulty: string
  question_count: number
}

export interface GenerateQuizRequest {
  notebook_id: string
  notebook_name?: string
  google_drive_link?: string
}

export interface GenerateQuizResponse {
  quiz_id: string
  message: string
  status: string
}

export interface GenerateSnapnotesRequest {
  notebook_id: string
  google_drive_link: string
}

export interface GenerateSnapnotesResponse {
  message: string
  status: string
}

class NotebooksAPI {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("cognivia_token") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = USE_PROXY
      ? endpoint // Use proxy routes (relative URLs)
      : `${API_BASE_URL}${endpoint}` // Direct API calls

    console.log(`Making request to: ${url}`)
    console.log(`Method: ${options.method || "GET"}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...(USE_PROXY ? {} : { mode: "cors" }),
      })

      console.log(`Response status: ${response.status}`)

      // Check if response is HTML (error page)
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        console.error("Received HTML instead of JSON:", htmlText.substring(0, 200))
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`)
      }

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.log(`Error response:`, errorData)

        if (response.status === 400) {
          throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
        } else if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.")
        } else if (response.status === 403) {
          throw new Error("Forbidden: You do not have permission to access this resource.")
        } else if (response.status === 404) {
          return null // Handle 404 as null, useful for polling
        } else if (response.status === 500) {
          throw new Error("Internal Server Error: Please try again later.")
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }
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

  // Add this helper function at the top of the NotebooksAPI class
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  async createNotebook(data: CreateNotebookRequest): Promise<Notebook> {
    const endpoint = USE_PROXY ? "/api/notebooks" : "/api/v1/notebooks/"
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getNotebook(id: string): Promise<Notebook> {
    if (!id) {
      throw new Error("Notebook ID is required")
    }

    // Validate ObjectID format
    if (!this.isValidObjectId(id)) {
      throw new Error("Invalid notebook ID format")
    }

    console.log(`API: Getting notebook with ID: ${id}`)
    const endpoint = USE_PROXY ? `/api/notebooks/${id}` : `/api/v1/notebooks/${id}`

    try {
      const result = await this.makeRequest(endpoint)
      console.log(`API: Notebook result for ID ${id}:`, result)

      if (!result) {
        throw new Error(`Notebook with ID ${id} not found`)
      }

      if (!result.id) {
        console.warn("API: Notebook data missing ID field:", result)
        throw new Error("Invalid notebook data: missing ID")
      }

      return result
    } catch (error) {
      console.error(`API: Error getting notebook ${id}:`, error)
      throw error
    }
  }

  async getUserNotebooks(): Promise<Notebook[]> {
    // Use the dedicated user notebooks endpoint
    const endpoint = "/api/notebooks/user"

    try {
      console.log("API: Getting user notebooks")
      const result = await this.makeRequest(endpoint)

      if (!result) {
        console.log("API: No notebooks found for user")
        return []
      }

      if (!Array.isArray(result)) {
        console.warn("API: User notebooks response is not an array:", result)
        return []
      }

      return result
    } catch (error) {
      console.error("API: Error getting user notebooks:", error)
      throw error
    }
  }

  async updateNotebook(id: string, data: Partial<CreateNotebookRequest>): Promise<{ message: string }> {
    // Validate ObjectID format
    if (!this.isValidObjectId(id)) {
      throw new Error("Invalid notebook ID format")
    }

    const endpoint = USE_PROXY ? `/api/notebooks/${id}` : `/api/v1/notebooks/${id}`
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteNotebook(id: string): Promise<{ message: string }> {
    // Validate ObjectID format
    if (!this.isValidObjectId(id)) {
      throw new Error("Invalid notebook ID format")
    }

    const endpoint = USE_PROXY ? `/api/notebooks/${id}` : `/api/v1/notebooks/${id}`
    return this.makeRequest(endpoint, {
      method: "DELETE",
    })
  }

  async getNotebookSnapnotes(id: string): Promise<Snapnotes> {
    // Validate ObjectID format
    if (!this.isValidObjectId(id)) {
      throw new Error("Invalid notebook ID format")
    }

    const endpoint = USE_PROXY ? `/api/notebooks/${id}/snapnotes` : `/api/v1/notebooks/${id}/snapnotes`
    return this.makeRequest(endpoint)
  }

  async getNotebookPrepPilot(id: string): Promise<PrepPilot> {
    // Validate ObjectID format
    if (!this.isValidObjectId(id)) {
      throw new Error("Invalid notebook ID format")
    }

    const endpoint = USE_PROXY ? `/api/notebooks/${id}/prep-pilot` : `/api/v1/notebooks/${id}/prep-pilot`
    return this.makeRequest(endpoint)
  }

  async createSnapnotes(data: CreateSnapnotesRequest): Promise<Snapnotes> {
    const endpoint = USE_PROXY ? "/api/snapnotes" : "/api/v1/snapnotes/"
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async createPrepPilot(data: CreatePrepPilotRequest): Promise<PrepPilot> {
    const endpoint = USE_PROXY ? "/api/prep-pilot" : "/api/v1/prep-pilot/"
    return this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // NEW: Generate Quiz using webhook
  async generateQuiz(data: GenerateQuizRequest): Promise<GenerateQuizResponse> {
    const webhookUrl = "https://ec2-13-60-68-60.eu-north-1.compute.amazonaws.com/webhook/generate-quiz"

    console.log(`Making quiz generation request to: ${webhookUrl}`)
    console.log(`Quiz generation data:`, data)

    try {
      const response = await axios.post(webhookUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000, // 3 minutes timeout for quiz generation
        withCredentials: false,
      })

      console.log(`Quiz generation response status: ${response.status}`)
      console.log(`Quiz generation success:`, response.data)

      return response.data
    } catch (error) {
      console.error("Quiz generation error:", error)

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            `HTTP ${error.response.status}: ${error.response.statusText}`
          throw new Error(errorMessage)
        } else if (error.request) {
          throw new Error("Network error: Unable to connect to quiz generation service.")
        } else {
          throw new Error(`Request setup error: ${error.message}`)
        }
      } else {
        throw new Error(`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
  }

  // NEW: Generate Snapnotes using local API
  async generateSnapnotes(data: GenerateSnapnotesRequest): Promise<GenerateSnapnotesResponse> {
    console.log(`Making snapnotes generation request`)
    console.log(`Snapnotes generation data:`, data)

    try {
      const response = await axios.post("/api/generate-snapnotes", data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000, // 3 minutes timeout for snapnotes generation
        withCredentials: false,
      })

      console.log(`Snapnotes generation response status: ${response.status}`)
      console.log(`Snapnotes generation success:`, response.data)

      return response.data
    } catch (error) {
      console.error("Snapnotes generation error:", error)

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error("Request timed out. The generation is taking longer than expected. Please try again later.")
        } else if (error.response) {
          const errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            `HTTP ${error.response.status}: ${error.response.statusText}`
          throw new Error(errorMessage)
        } else if (error.request) {
          throw new Error("Network error: Unable to connect to snapnotes generation service.")
        } else {
          throw new Error(`Request setup error: ${error.message}`)
        }
      } else {
        throw new Error(`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
  }

  // NEW: Update notebook with prep_pilot_id
  async updateNotebookPrepPilotId(notebookId: string, prepPilotId: string): Promise<{ message: string }> {
    return this.updateNotebook(notebookId, { prep_pilot_id: prepPilotId } as any)
  }

  async sendChatMessage(data: {
    sessionId: string
    action: string
    chatInput: string
    google_drive_link: string
  }): Promise<{ response?: string; message?: string }> {
    // Use axios for better CORS and error handling
    const webhookUrl =
      "https://ec2-13-60-68-60.eu-north-1.compute.amazonaws.com/webhook/a889d2ae-2159-402f-b326-5f61e90f602e/chat"

    console.log(`Making axios chat request to: ${webhookUrl}`)
    console.log(`Chat request data:`, data)

    try {
      const response = await axios.post(webhookUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // 2 minutes timeout
        withCredentials: false, // Don't send cookies
      })

      console.log(`Chat webhook response status: ${response.status}`)
      console.log(`Chat webhook success:`, response.data)

      return response.data
    } catch (error) {
      console.error("Chat webhook error:", error)

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            `HTTP ${error.response.status}: ${error.response.statusText}`
          throw new Error(errorMessage)
        } else if (error.request) {
          // Request was made but no response received
          throw new Error("Network error: Unable to connect to chat service. Please check your internet connection.")
        } else {
          // Something else happened
          throw new Error(`Request setup error: ${error.message}`)
        }
      } else {
        // Non-axios error
        throw new Error(`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
  }

  async updateNotebookWithDriveLink(id: string, googleDriveLink: string): Promise<{ message: string }> {
    const endpoint = USE_PROXY ? `/api/notebooks/${id}` : `/api/v1/notebooks/${id}`
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify({
        google_drive_link: googleDriveLink,
      }),
    })
  }

  // Generate content based on notebook name and type
  generateContentForNotebook(
    notebookName: string,
    notebookType: string,
  ): { snapnotes: Snapnotes; prepPilot: PrepPilot } {
    const isAmharic = notebookName.toLowerCase().includes("amharic") || notebookName.toLowerCase().includes("አማርኛ")
    const isBiology = notebookName.toLowerCase().includes("biology") || notebookName.toLowerCase().includes("ባዮሎጂ")
    const isChemistry = notebookName.toLowerCase().includes("chemistry") || notebookName.toLowerCase().includes("ኬሚስትሪ")
    const isMath = notebookName.toLowerCase().includes("math") || notebookName.toLowerCase().includes("ሂሳብ")

    if (isAmharic) {
      return this.generateAmharicContent()
    } else if (isBiology) {
      return this.generateBiologyContent()
    } else if (isChemistry) {
      return this.generateChemistryContent()
    } else if (isMath) {
      return this.generateMathContent()
    } else {
      return this.generateGeneralContent(notebookName)
    }
  }

  private generateAmharicContent(): { snapnotes: Snapnotes; prepPilot: PrepPilot } {
    const snapnotes: Snapnotes = {
      id: "amharic-snapnotes",
      title: "የአማርኛ ቋንቋ ማጠቃለያ",
      summaryByChapter: [
        {
          chapterTitle: "የአማርኛ ፊደላት እና ድምፆች",
          summary: "አማርኛ 33 መሰረታዊ ፊደላት አሉት። እያንዳንዱ ፊደል ሰባት ቅርጾች (ሳድስ ቅደም) አሉት። የአማርኛ ፊደላት ከግዕዝ ፊደላት የተወሰዱ ናቸው።",
          keyPoints: ["33 መሰረታዊ ፊደላት", "እያንዳንዱ ፊደል 7 ቅርጾች አሉት", "ከግዕዝ ፊደላት የተወሰዱ", "የድምፅ እና የፊደል ግንኙነት"],
        },
        {
          chapterTitle: "የአማርኛ ሰዋሰው",
          summary: "አማርኛ ሴማዊ ቋንቋ ነው። ዋናዋና የሰዋሰው ክፍሎች፡ ስም፣ ግስ፣ ቅጽል፣ ተውላጠ ስም፣ እና ሌሎች የንግግር ክፍሎች ያካትታል።",
          keyPoints: ["ሴማዊ ቋንቋ ቤተሰብ", "ስም፣ ግስ፣ ቅጽል", "የግስ ጊዜዎች", "የአረፍተ ነገር አወቃቀር"],
        },
        {
          chapterTitle: "የአማርኛ ስነ-ጽሁፍ",
          summary: "የአማርኛ ስነ-ጽሁፍ ረጅም ታሪክ አለው። ከባህላዊ ግጥሞች እስከ ዘመናዊ ልብ ወለድ እና ድራማዎች ድረስ የተለያዩ ዓይነቶች ያካትታል።",
          keyPoints: ["ባህላዊ ግጥሞች እና ዘፈኖች", "ዘመናዊ ልብ ወለድ", "ድራማ እና ቲያትር", "የታሪክ ጽሁፎች"],
        },
      ],
      flashcards: [
        {
          chapterTitle: "የአማርኛ ፊደላት እና ድምፆች",
          flashcards: [
            { "key term": "ፊደል", definition: "የድምፅን የሚወክል ምልክት" },
            { "key term": "ሳድስ ቅደም", definition: "እያንዳንዱ ፊደል ያለው ሰባት ቅርጾች" },
            { "key term": "ግዕዝ", definition: "የአማርኛ ፊደላት የመጡበት ጥንታዊ ቋንቋ" },
          ],
        },
      ],
    }

    const prepPilot: PrepPilot = {
      id: "amharic-prep-pilot",
      notebook_id: "amharic-notebook",
      chapters: [
        {
          chapterTitle: "የአማርኛ ፊደላት እና ድምፆች",
          questions: [
            {
              question: "አማርኛ ስንት መሰረታዊ ፊደላት አሉት?",
              options: { A: "30", B: "33", C: "35", D: "37" },
              answer: "B",
              explanation: "አማርኛ 33 መሰረታዊ ፊደላት አሉት።",
            },
            {
              question: "እያንዳንዱ የአማርኛ ፊደል ስንት ቅርጾች አሉት?",
              options: { A: "5", B: "6", C: "7", D: "8" },
              answer: "C",
              explanation: "እያንዳንዱ ፊደል ሰባት ቅርጾች (ሳድስ ቅደም) አሉት።",
            },
          ],
        },
      ],
    }

    return { snapnotes, prepPilot }
  }

  private generateBiologyContent(): { snapnotes: Snapnotes; prepPilot: PrepPilot } {
    const snapnotes: Snapnotes = {
      id: "biology-snapnotes",
      title: "Biology 11 Study Guide",
      summaryByChapter: [
        {
          chapterTitle: "Introduction to Biology",
          summary:
            "Biology is the scientific study of living organisms and their interactions with the environment. This chapter introduces the fundamental concepts that govern all life on Earth.",
          keyPoints: [
            "Definition and scope of Biology",
            "Characteristics of living organisms",
            "Levels of biological organization",
            "Scientific method in biology",
            "Major themes: evolution, energy, information",
          ],
        },
        {
          chapterTitle: "Cell Biology",
          summary:
            "Cells are the fundamental units of life. This chapter explores cell structure, function, and the differences between prokaryotic and eukaryotic cells.",
          keyPoints: [
            "Cell theory principles",
            "Prokaryotic vs eukaryotic cells",
            "Cell membrane and transport",
            "Organelles and their functions",
            "Cell division processes",
          ],
        },
        {
          chapterTitle: "Genetics and Heredity",
          summary: "Genetics studies how traits are passed from parents to offspring through DNA and chromosomes.",
          keyPoints: [
            "DNA structure and replication",
            "Mendel's laws of inheritance",
            "Dominant and recessive alleles",
            "Genetic crosses and probability",
            "Chromosomal disorders",
          ],
        },
      ],
      flashcards: [
        {
          chapterTitle: "Introduction to Biology",
          flashcards: [
            { "key term": "Biology", definition: "The scientific study of living organisms and their interactions" },
            { "key term": "Homeostasis", definition: "Maintenance of stable internal conditions in organisms" },
            { "key term": "Evolution", definition: "Change in species over time through natural selection" },
          ],
        },
        {
          chapterTitle: "Cell Biology",
          flashcards: [
            {
              "key term": "Cell Theory",
              definition: "All living things are made of cells; cells are the basic unit of life",
            },
            { "key term": "Mitochondria", definition: "Organelles that produce ATP energy for cellular processes" },
            { "key term": "Nucleus", definition: "Control center of the cell containing DNA" },
          ],
        },
      ],
    }

    const prepPilot: PrepPilot = {
      id: "biology-prep-pilot",
      notebook_id: "biology-notebook",
      chapters: [
        {
          chapterTitle: "Introduction to Biology",
          questions: [
            {
              question: "What is the basic unit of life?",
              options: { A: "Atom", B: "Cell", C: "Molecule", D: "Tissue" },
              answer: "B",
              explanation: "The cell is the basic unit of life according to cell theory.",
            },
            {
              question: "Which process explains the diversity of life?",
              options: { A: "Photosynthesis", B: "Respiration", C: "Evolution", D: "Digestion" },
              answer: "C",
              explanation: "Evolution through natural selection explains the diversity of life on Earth.",
            },
          ],
        },
        {
          chapterTitle: "Cell Biology",
          questions: [
            {
              question: "Which organelle is known as the powerhouse of the cell?",
              options: { A: "Nucleus", B: "Ribosome", C: "Mitochondria", D: "ER" },
              answer: "C",
              explanation: "Mitochondria produce ATP energy, earning them the nickname 'powerhouse of the cell'.",
            },
          ],
        },
      ],
    }

    return { snapnotes, prepPilot }
  }

  private generateChemistryContent(): { snapnotes: Snapnotes; prepPilot: PrepPilot } {
    const snapnotes: Snapnotes = {
      id: "chemistry-snapnotes",
      title: "Chemistry Study Guide",
      summaryByChapter: [
        {
          chapterTitle: "Atomic Structure",
          summary: "Atoms are the basic building blocks of matter, consisting of protons, neutrons, and electrons.",
          keyPoints: [
            "Subatomic particles",
            "Electron configuration",
            "Periodic table organization",
            "Atomic mass and number",
          ],
        },
      ],
      flashcards: [
        {
          chapterTitle: "Atomic Structure",
          flashcards: [
            { "key term": "Atom", definition: "The smallest unit of matter that retains chemical properties" },
            { "key term": "Electron", definition: "Negatively charged particle orbiting the nucleus" },
          ],
        },
      ],
    }

    const prepPilot: PrepPilot = {
      id: "chemistry-prep-pilot",
      notebook_id: "chemistry-notebook",
      chapters: [
        {
          chapterTitle: "Atomic Structure",
          questions: [
            {
              question: "What is the charge of a proton?",
              options: { A: "Positive", B: "Negative", C: "Neutral", D: "Variable" },
              answer: "A",
              explanation: "Protons have a positive electrical charge.",
            },
          ],
        },
      ],
    }

    return { snapnotes, prepPilot }
  }

  private generateMathContent(): { snapnotes: Snapnotes; prepPilot: PrepPilot } {
    const snapnotes: Snapnotes = {
      id: "math-snapnotes",
      title: "Mathematics Study Guide",
      summaryByChapter: [
        {
          chapterTitle: "Algebra Basics",
          summary: "Algebra involves working with variables and equations to solve mathematical problems.",
          keyPoints: ["Variables and constants", "Linear equations", "Quadratic equations", "Factoring techniques"],
        },
      ],
      flashcards: [
        {
          chapterTitle: "Algebra Basics",
          flashcards: [
            { "key term": "Variable", definition: "A symbol representing an unknown value" },
            { "key term": "Equation", definition: "Mathematical statement showing equality between expressions" },
          ],
        },
      ],
    }

    const prepPilot: PrepPilot = {
      id: "math-prep-pilot",
      notebook_id: "math-notebook",
      chapters: [
        {
          chapterTitle: "Algebra Basics",
          questions: [
            {
              question: "What is 2x + 3 = 7, solve for x?",
              options: { A: "1", B: "2", C: "3", D: "4" },
              answer: "B",
              explanation: "2x = 7 - 3 = 4, so x = 2",
            },
          ],
        },
      ],
    }

    return { snapnotes, prepPilot }
  }

  private generateGeneralContent(notebookName: string): { snapnotes: Snapnotes; prepPilot: PrepPilot } {
    const snapnotes: Snapnotes = {
      id: "general-snapnotes",
      title: `${notebookName} Study Guide`,
      summaryByChapter: [
        {
          chapterTitle: "Introduction",
          summary: `This is an introduction to ${notebookName}. Key concepts and foundational knowledge are covered here.`,
          keyPoints: [
            "Basic definitions and terminology",
            "Historical context",
            "Key principles",
            "Applications and importance",
          ],
        },
      ],
      flashcards: [
        {
          chapterTitle: "Introduction",
          flashcards: [{ "key term": "Key Concept", definition: `Important idea in ${notebookName}` }],
        },
      ],
    }

    const prepPilot: PrepPilot = {
      id: "general-prep-pilot",
      notebook_id: "general-notebook",
      chapters: [
        {
          chapterTitle: "Introduction",
          questions: [
            {
              question: `What is the main focus of ${notebookName}?`,
              options: { A: "Theory", B: "Practice", C: "Both", D: "Neither" },
              answer: "C",
              explanation: `${notebookName} typically involves both theoretical understanding and practical application.`,
            },
          ],
        },
      ],
    }

    return { snapnotes, prepPilot }
  }

  async getNotebookSnapnotesWithRetry(id: string, retries = 3, delay = 1000): Promise<Snapnotes | null> {
    try {
      const snapnotes = await this.getNotebookSnapnotes(id)
      return snapnotes
    } catch (error: any) {
      if (error.message.includes("still being generated") && retries > 0) {
        console.log(`Snapnotes not ready, retrying in ${delay}ms... (${retries} retries remaining)`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.getNotebookSnapnotesWithRetry(id, retries - 1, delay * 2) // Increase delay for next retry
      } else if (error.message.includes("Request failed with status code 404")) {
        return null // Handle 404 as null
      }
      throw error // Re-throw the error if it's not a "still being generated" error or no retries left
    }
  }
}

export const notebooksAPI = new NotebooksAPI()
