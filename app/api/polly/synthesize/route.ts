import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, voiceId = "Joanna", engine = "standard" } = await request.json()

    // AWS Credentials from environment variables
    const AWS_CREDENTIALS = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION!,
    }

    const baseUrl = process.env.AWS_POLLY_ENDPOINT || "https://polly.eu-central-1.amazonaws.com"

    // Create AWS signature and headers
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "")
    const dateStamp = amzDate.substring(0, 8)

    const payload = JSON.stringify({
      Text: text,
      VoiceId: voiceId,
      OutputFormat: "mp3",
      Engine: engine,
    })

    const payloadHash = await sha256(payload)
    const region = AWS_CREDENTIALS.region
    const endpoint = `${baseUrl}/v1/speech`
    const service = "polly"

    const canonicalHeaders = [
      `host:polly.${region}.amazonaws.com`,
      `x-amz-date:${amzDate}`,
      `x-amz-target:com.amazonaws.polly.service.Polly_20160610.SynthesizeSpeech`,
    ].join("\n")

    const signedHeaders = "host;x-amz-date;x-amz-target"
    const canonicalRequest = `POST\n/v1/speech\n\n${canonicalHeaders}\n\n${signedHeaders}\n${payloadHash}`

    const canonicalRequestHash = await sha256(canonicalRequest)

    const algorithm = "AWS4-HMAC-SHA256"
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`

    const signature = await getSignature(
      AWS_CREDENTIALS.secretAccessKey,
      dateStamp,
      region,
      service,
      stringToSign
    )

    const authorizationHeader = `${algorithm} Credential=${AWS_CREDENTIALS.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const headers = {
      "Authorization": authorizationHeader,
      "Content-Type": "application/x-amz-json-1.0",
      "X-Amz-Date": amzDate,
      "X-Amz-Target": "com.amazonaws.polly.service.Polly_20160610.SynthesizeSpeech",
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: payload,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("AWS Polly API error:", errorText)
      throw new Error(`AWS Polly API error: ${response.status} - ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" })
    const audioUrl = URL.createObjectURL(audioBlob)

    return NextResponse.json({
      audioUrl,
      success: true,
    })
  } catch (error) {
    console.error("Error in Polly synthesis:", error)
    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    )
  }
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

async function hmac(key: CryptoKey, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  return await crypto.subtle.sign("HMAC", key, data)
}

async function getSignature(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
  stringToSign: string
): Promise<string> {
  const encoder = new TextEncoder()

  // Import the secret key
  const kSecret = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`AWS4${secretKey}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  // Create signing key
  const kDate = await crypto.subtle.importKey(
    "raw",
    await hmac(kSecret, dateStamp),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const kRegion = await crypto.subtle.importKey(
    "raw",
    await hmac(kDate, region),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const kService = await crypto.subtle.importKey(
    "raw",
    await hmac(kRegion, service),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const kSigning = await crypto.subtle.importKey(
    "raw",
    await hmac(kService, "aws4_request"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await hmac(kSigning, stringToSign)
  const signatureArray = Array.from(new Uint8Array(signature))
  return signatureArray.map(b => b.toString(16).padStart(2, "0")).join("")
}
