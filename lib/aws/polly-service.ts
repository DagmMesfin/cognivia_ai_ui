// Browser-compatible Polly service
export interface PollyOptions {
  voice?: string
  engine?: string
  outputFormat?: string
  sampleRate?: string
}

export interface PollyResponse {
  audioUrl: string
  audioBuffer: ArrayBuffer
}

// Available Polly voices
export const VoiceId = {
  Joanna: "Joanna",
  Matthew: "Matthew",
  Ruth: "Ruth",
  Danielle: "Danielle",
  Stephen: "Stephen"
} as const

export type VoiceIdType = (typeof VoiceId)[keyof typeof VoiceId]

// AWS Credentials from environment variables (browser-safe via NEXT_PUBLIC_*)
const AWS_CREDENTIALS = {
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
}

class PollyService {
  private baseUrl = process.env.NEXT_PUBLIC_AWS_POLLY_ENDPOINT!

  async synthesizeSpeech(text: string, options: PollyOptions = {}): Promise<PollyResponse> {
    const { voice = VoiceId.Danielle, engine = "generative", outputFormat = "mp3", sampleRate = "22050" } = options

    try {
      console.log(`Synthesizing speech with Polly...`)
      console.log(`Text: ${text.substring(0, 100)}...`)
      console.log(`Voice: ${voice}, Engine: ${engine}`)

      // Create the request payload
      const payload = {
        Text: text,
        VoiceId: voice,
        OutputFormat: outputFormat,
        Engine: engine,
        SampleRate: sampleRate,
        TextType: "text",
      }

      // Create AWS signature and headers
      const { headers, url } = await this.createSignedRequest(payload)

      // Make the request to Polly
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Polly API error: ${response.status} - ${errorText}`)
      }

      // Get the audio data as ArrayBuffer
      const audioBuffer = await response.arrayBuffer()

      // Create a blob URL for playback
      const audioBlob = new Blob([audioBuffer], { type: `audio/${outputFormat}` })
      const audioUrl = URL.createObjectURL(audioBlob)

      console.log(`Speech synthesis successful. Audio URL created.`)

      return { audioUrl, audioBuffer }
    } catch (error) {
      console.error("Error synthesizing speech with Polly:", error)
      throw new Error(`Failed to synthesize speech: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private async createSignedRequest(payload: any) {
    const service = "polly"
    const region = AWS_CREDENTIALS.region
    const endpoint = `${this.baseUrl}/v1/speech`

    // Create timestamp
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
    const dateStamp = amzDate.substr(0, 8)

    // Create canonical request
    const method = "POST"
    const canonicalUri = "/v1/speech"
    const canonicalQuerystring = ""
    const payloadHash = await this.sha256(JSON.stringify(payload))

    const canonicalHeaders =
      [
        `host:polly.${region}.amazonaws.com`,
        `x-amz-date:${amzDate}`,
        `x-amz-target:com.amazon.polly.service.Polly_20160610.SynthesizeSpeech`,
      ].join("\n") + "\n"

    const signedHeaders = "host;x-amz-date;x-amz-target"

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n")

    // Create string to sign
    const algorithm = "AWS4-HMAC-SHA256"
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = [algorithm, amzDate, credentialScope, await this.sha256(canonicalRequest)].join("\n")

    // Calculate signature
    const signature = await this.calculateSignature(
      AWS_CREDENTIALS.secretAccessKey,
      dateStamp,
      region,
      service,
      stringToSign,
    )

    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${AWS_CREDENTIALS.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const headers = {
      Authorization: authorizationHeader,
      "Content-Type": "application/x-amz-json-1.0",
      "X-Amz-Date": amzDate,
      "X-Amz-Target": "com.amazon.polly.service.Polly_20160610.SynthesizeSpeech",
    }

    return { headers, url: endpoint }
  }

  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private async hmac(key: CryptoKey, message: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    return await crypto.subtle.sign("HMAC", key, data)
  }

  private async calculateSignature(
    secretKey: string,
    dateStamp: string,
    region: string,
    service: string,
    stringToSign: string,
  ): Promise<string> {
    const encoder = new TextEncoder()

    // Import the secret key
    const kSecret = await crypto.subtle.importKey(
      "raw",
      encoder.encode(`AWS4${secretKey}`),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    // Create signing key
    const kDate = await crypto.subtle.importKey(
      "raw",
      await this.hmac(kSecret, dateStamp),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    const kRegion = await crypto.subtle.importKey(
      "raw",
      await this.hmac(kDate, region),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    const kService = await crypto.subtle.importKey(
      "raw",
      await this.hmac(kRegion, service),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    const kSigning = await crypto.subtle.importKey(
      "raw",
      await this.hmac(kService, "aws4_request"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    // Sign the string
    const signature = await this.hmac(kSigning, stringToSign)
    const signatureArray = Array.from(new Uint8Array(signature))
    return signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Get available voices for different languages
  getAvailableVoices() {
    return {
      english: {
        female: [VoiceId.Joanna, VoiceId.Ruth, VoiceId.Danielle],
        male: [VoiceId.Matthew, VoiceId.Stephen],
      },
    }
  }

  // Clean up blob URLs to prevent memory leaks
  cleanupAudioUrl(url: string) {
    if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url)
        console.log("Audio URL cleaned up:", url)
      } catch (error) {
        console.warn("Failed to cleanup audio URL:", error)
      }
    }
  }

  // Static method for backward compatibility
  static cleanupAudioUrl(url: string) {
    if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url)
        console.log("Audio URL cleaned up (static):", url)
      } catch (error) {
        console.warn("Failed to cleanup audio URL (static):", error)
      }
    }
  }
}

export const pollyService = new PollyService()
export { VoiceId as PollyVoiceId }
