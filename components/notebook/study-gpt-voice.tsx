"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Volume2, VolumeX, MessageCircle, Smartphone, AlertTriangle } from "lucide-react"
import { pollyService, VoiceId, type VoiceIdType } from "@/lib/aws/polly-service"
import { AssistantAvatar } from "@/components/voice/assistant-avatar"

interface StudyGPTVoiceProps {
  onExitVoiceMode: () => void
  onSendMessage?: (message: string) => void
  notebookId: string
}

export function StudyGPTVoice({ onExitVoiceMode, onSendMessage, notebookId }: StudyGPTVoiceProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<any>(null)
  const [lastMessage, setLastMessage] = useState("")
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("")
  const [pollyError, setPollyError] = useState<string>("")
  const [speechError, setSpeechError] = useState<string>("")

  // Mobile detection and support
  const [isMobile, setIsMobile] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")

  // Settings state
  const [selectedVoice, setSelectedVoice] = useState<VoiceIdType>(VoiceId.Danielle)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [speechRate, setSpeechRate] = useState([1])
  const [speechVolume, setSpeechVolume] = useState([1])
  const [usePolly, setUsePolly] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Audio analysis state
  const [audioLevel, setAudioLevel] = useState(0)
  const [realTimeAudioLevel, setRealTimeAudioLevel] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to safely cleanup audio URLs
  const cleanupAudioUrl = (url: string) => {
    if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url)
        console.log("Audio URL cleaned up:", url)
      } catch (error) {
        console.warn("Failed to cleanup audio URL:", error)
      }
    }
  }

  // Detect mobile device and check speech recognition support
  useEffect(() => {
    const checkMobileAndSupport = () => {
      // Mobile detection
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(isMobileDevice)

      // Speech recognition support check
      const hasWebkitSpeech = "webkitSpeechRecognition" in window
      const hasSpeech = "SpeechRecognition" in window
      const isSupported = hasWebkitSpeech || hasSpeech
      setSpeechSupported(isSupported)

      console.log("Device info:", {
        isMobile: isMobileDevice,
        speechSupported: isSupported,
        userAgent: userAgent.substring(0, 100),
      })
    }

    checkMobileAndSupport()
  }, [])

  // Check microphone permissions
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
          setMicPermission(permission.state)

          permission.onchange = () => {
            setMicPermission(permission.state)
          }
        }
      } catch (error) {
        console.log("Permission API not supported:", error)
        setMicPermission("unknown")
      }
    }

    checkMicPermission()
  }, [])

  useEffect(() => {
    // Initialize speech recognition with mobile-specific settings
    if (speechSupported) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      // Mobile-optimized settings
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"
      recognitionInstance.maxAlternatives = 1

      // Mobile-specific settings
      if (isMobile) {
        recognitionInstance.continuous = false // More reliable on mobile
        recognitionInstance.interimResults = false // Reduce processing on mobile
      }

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started")
        setIsListening(true)
        setTranscript("")
        setSpeechError("")
        startMicrophoneAnalysis()

        // Set a timeout for mobile devices (they tend to stop listening after inactivity)
        if (isMobile) {
          recognitionTimeoutRef.current = setTimeout(() => {
            if (isListening) {
              console.log("Mobile speech recognition timeout")
              recognitionInstance.stop()
            }
          }, 10000) // 10 seconds timeout on mobile
        }
      }

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const currentTranscript = finalTranscript || interimTranscript
        setTranscript(currentTranscript)

        if (finalTranscript) {
          console.log("Final transcript:", finalTranscript)
          setIsListening(false)
          setIsProcessing(true)
          stopAudioAnalysis()
          clearTimeout(recognitionTimeoutRef.current!)
          handleVoiceMessage(finalTranscript)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)

        let errorMessage = "Speech recognition error"
        switch (event.error) {
          case "no-speech":
            errorMessage = isMobile ? "No speech detected. Please speak clearly and try again." : "No speech detected"
            break
          case "audio-capture":
            errorMessage = "Microphone not accessible. Please check permissions."
            break
          case "not-allowed":
            errorMessage = "Microphone permission denied. Please allow microphone access."
            break
          case "network":
            errorMessage = isMobile ? "Network error. Please check your connection." : "Network error"
            break
          case "service-not-allowed":
            errorMessage = isMobile
              ? "Speech service not available. Try refreshing the page."
              : "Speech service not available"
            break
          default:
            errorMessage = `Speech error: ${event.error}`
        }

        setSpeechError(errorMessage)
        setIsListening(false)
        setIsProcessing(false)
        stopAudioAnalysis()
        clearTimeout(recognitionTimeoutRef.current!)
      }

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended")
        setIsListening(false)
        stopAudioAnalysis()
        clearTimeout(recognitionTimeoutRef.current!)
      }

      setRecognition(recognitionInstance)
    }

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop()
      }
      if (currentAudioUrl) {
        cleanupAudioUrl(currentAudioUrl)
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current)
      }
      stopAudioAnalysis()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [speechSupported, isMobile])

  // Handle page visibility changes (important for mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isListening && recognition) {
        console.log("Page hidden, stopping speech recognition")
        recognition.stop()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isListening, recognition])

  const initializeAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Resume audio context if suspended (common on mobile)
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume()
        }

        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        analyserRef.current.smoothingTimeConstant = 0.8
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
      }
    } catch (error) {
      console.error("Failed to initialize audio context:", error)
    }
  }

  const startMicrophoneAnalysis = async () => {
    try {
      await initializeAudioContext()

      if (!audioContextRef.current || !analyserRef.current) return

      // Get microphone access with mobile-optimized constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(isMobile && {
            sampleRate: 16000, // Lower sample rate for mobile
            channelCount: 1, // Mono for mobile
          }),
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      micStreamRef.current = stream

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const analyze = () => {
        if (isListening && analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current)

          // Calculate average amplitude for microphone input
          const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length
          const normalizedLevel = Math.min(100, (average / 128) * 100)

          setRealTimeAudioLevel(normalizedLevel)
          setAudioLevel(normalizedLevel)

          animationRef.current = requestAnimationFrame(analyze)
        }
      }

      analyze()
    } catch (error) {
      console.error("Failed to start microphone analysis:", error)
      // Fallback to simulated levels
      startSimulatedListeningAnalysis()
    }
  }

  const startSimulatedListeningAnalysis = () => {
    const analyze = () => {
      if (isListening) {
        const level = Math.random() * 60 + 20
        setAudioLevel(level)
        setRealTimeAudioLevel(level)
        animationRef.current = requestAnimationFrame(analyze)
      }
    }
    analyze()
  }

  const startSpeakingAnalysis = async () => {
    await initializeAudioContext()

    if (audioRef.current && audioContextRef.current && analyserRef.current) {
      try {
        // Connect audio element to analyser
        const source = audioContextRef.current.createMediaElementSource(audioRef.current)
        source.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      } catch (error) {
        // Source might already be connected
        console.log("Audio source already connected or failed to connect")
      }
    }

    const analyze = () => {
      if (isSpeaking && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)

        // Calculate average amplitude for speech output
        const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length
        const normalizedLevel = Math.min(100, (average / 128) * 100)

        setAudioLevel(normalizedLevel)
        setRealTimeAudioLevel(normalizedLevel)

        animationRef.current = requestAnimationFrame(analyze)
      } else if (isSpeaking) {
        // Fallback visualization if audio context fails
        const level = Math.random() * 70 + 30
        setAudioLevel(level)
        setRealTimeAudioLevel(level)
        animationRef.current = requestAnimationFrame(analyze)
      }
    }
    analyze()
  }

  const stopAudioAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }
    setAudioLevel(0)
    setRealTimeAudioLevel(0)
  }

  const handleVoiceMessage = async (message: string) => {
    setLastMessage(message)
    setTranscript("")

    try {
      if (onSendMessage) {
        await onSendMessage(message)
      }

      // Set a timeout to stop processing if no response comes
      const timeoutId = setTimeout(() => {
        if (isProcessing) {
          setIsProcessing(false)
          console.warn("Voice message timeout - no response received")
        }
      }, 30000)
    } catch (error) {
      console.error("Voice message error:", error)
      setIsProcessing(false)
    }
  }

  const handleAIResponse = async (response: string) => {
    console.log("Received AI response in voice mode:", response)
    setIsProcessing(false)

    if (autoSpeak && response.trim()) {
      if (usePolly) {
        await speakWithPolly(response)
      } else {
        fallbackToWebSpeech(response)
      }
    }
  }

  // Expose handleAIResponse to parent component
  useEffect(() => {
    ;(window as any).voiceHandleAIResponse = handleAIResponse

    return () => {
      delete (window as any).voiceHandleAIResponse
    }
  }, [autoSpeak, usePolly, selectedVoice, speechRate, speechVolume])

  const speakWithPolly = async (text: string) => {
    try {
      setIsSpeaking(true)
      setPollyError("")
      startSpeakingAnalysis()
      console.log("Converting text to speech with Amazon Polly...")

      if (currentAudioUrl) {
        cleanupAudioUrl(currentAudioUrl)
      }

      const { audioUrl } = await pollyService.synthesizeSpeech(text, {
        voice: selectedVoice,
        engine: "generative",
        outputFormat: "mp3",
      })

      setCurrentAudioUrl(audioUrl)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.volume = speechVolume[0]
        audioRef.current.playbackRate = speechRate[0]

        // Mobile-specific audio handling
        if (isMobile) {
          audioRef.current.preload = "auto"
          audioRef.current.playsInline = true
        }

        audioRef.current.onended = () => {
          setIsSpeaking(false)
          stopAudioAnalysis()
          console.log("Speech playback completed")
        }

        audioRef.current.onerror = (error) => {
          console.error("Audio playback error:", error)
          setIsSpeaking(false)
          stopAudioAnalysis()
          fallbackToWebSpeech(text)
        }

        await audioRef.current.play()
      }
    } catch (error) {
      console.error("Error with Polly speech synthesis:", error)
      setPollyError(error instanceof Error ? error.message : "Unknown Polly error")
      setIsSpeaking(false)
      stopAudioAnalysis()
      fallbackToWebSpeech(text)
    }
  }

  const fallbackToWebSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      startSpeakingAnalysis()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = speechRate[0]
      utterance.pitch = 1
      utterance.volume = speechVolume[0]

      // Mobile-specific settings
      if (isMobile) {
        utterance.rate = Math.min(speechRate[0], 1.2) // Slower on mobile
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        stopAudioAnalysis()
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        stopAudioAnalysis()
      }

      speechSynthesis.speak(utterance)
    } else {
      setIsSpeaking(false)
      stopAudioAnalysis()
    }
  }

  const toggleListening = async () => {
    if (!speechSupported) {
      setSpeechError("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.")
      return
    }

    if (!recognition) {
      setSpeechError("Speech recognition is not available. Please refresh the page and try again.")
      return
    }

    if (micPermission === "denied") {
      setSpeechError("Microphone permission denied. Please allow microphone access in your browser settings.")
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else if (!isProcessing && !isSpeaking) {
      try {
        // Request microphone permission explicitly on mobile
        if (isMobile && micPermission !== "granted") {
          await navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              stream.getTracks().forEach((track) => track.stop())
              setMicPermission("granted")
            })
            .catch((error) => {
              console.error("Microphone permission error:", error)
              setSpeechError("Microphone access denied. Please allow microphone access and try again.")
              return
            })
        }

        setSpeechError("")
        recognition.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setSpeechError("Failed to start speech recognition. Please try again.")
      }
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    stopAudioAnalysis()
  }

  const testVoice = async () => {
    const testText = `Hello! I'm your AI study assistant using the ${selectedVoice} voice. How can I help you with your studies today?`
    if (usePolly) {
      await speakWithPolly(testText)
    } else {
      fallbackToWebSpeech(testText)
    }
  }

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicPermission("granted")
      setSpeechError("")
    } catch (error) {
      console.error("Microphone permission error:", error)
      setMicPermission("denied")
      setSpeechError("Microphone access denied. Please allow microphone access in your browser settings.")
    }
  }

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/50 dark:from-background dark:via-background/95 dark:to-muted/20 rounded-lg relative border border-border/50">
      {/* Settings Button */}
      <div className="absolute top-4 right-4">
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-background/95 backdrop-blur-sm border-border/50">
            <SheetHeader>
              <SheetTitle>Voice Settings</SheetTitle>
              <SheetDescription>Customize your voice interaction experience</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Device Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm font-medium">Device Info</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Device: {isMobile ? "Mobile" : "Desktop"}</p>
                  <p>Speech Support: {speechSupported ? "✅ Yes" : "❌ No"}</p>
                  <p>
                    Microphone:{" "}
                    {micPermission === "granted"
                      ? "✅ Allowed"
                      : micPermission === "denied"
                        ? "❌ Denied"
                        : "⏳ Unknown"}
                  </p>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>AI Voice</Label>
                <Select value={selectedVoice} onValueChange={(value) => setSelectedVoice(value as VoiceIdType)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VoiceId.Danielle}>Danielle (Female, US)</SelectItem>
                    <SelectItem value={VoiceId.Joanna}>Joanna (Female, US)</SelectItem>
                    <SelectItem value={VoiceId.Matthew}>Matthew (Male, US)</SelectItem>
                    <SelectItem value={VoiceId.Stephen}>Stephen (Male, US)</SelectItem>
                    <SelectItem value={VoiceId.Ruth}>Ruth (Female, US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-speak toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-speak">Auto-speak responses</Label>
                <Switch id="auto-speak" checked={autoSpeak} onCheckedChange={setAutoSpeak} />
              </div>

              {/* Use Polly toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="use-polly">Use Amazon Polly</Label>
                <Switch id="use-polly" checked={usePolly} onCheckedChange={setUsePolly} />
              </div>

              {/* Speech Rate */}
              <div className="space-y-2">
                <Label>Speech Rate: {speechRate[0].toFixed(1)}x</Label>
                <Slider
                  value={speechRate}
                  onValueChange={setSpeechRate}
                  max={isMobile ? 1.5 : 2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Speech Volume */}
              <div className="space-y-2">
                <Label>Volume: {Math.round(speechVolume[0] * 100)}%</Label>
                <Slider
                  value={speechVolume}
                  onValueChange={setSpeechVolume}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Test Voice Button */}
              <Button onClick={testVoice} disabled={isListening || isProcessing || isSpeaking} className="w-full">
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice
              </Button>

              {/* Request Microphone Permission */}
              {micPermission !== "granted" && (
                <Button onClick={requestMicrophonePermission} variant="outline" className="w-full">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Allow Microphone Access
                </Button>
              )}

              {/* Error Display */}
              {pollyError && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive mb-1">Polly Error:</p>
                  <p className="text-destructive text-xs">{pollyError}</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="text-center max-w-md">
        <h2 className="mb-8 text-2xl font-bold text-foreground">Voice Mode Active</h2>

        {/* Mobile warning */}
        {isMobile && !speechSupported && (
          <div className="mb-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium text-warning">Limited Support</p>
            </div>
            <p className="text-xs text-warning/80">
              Speech recognition may not work properly on this device. Please use Chrome or Safari for the best
              experience.
            </p>
          </div>
        )}

        {/* Lottie-powered Assistant Avatar */}
        <div className="mb-8">
          <AssistantAvatar
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            audioLevel={realTimeAudioLevel}
          />
        </div>

        {/* Current transcript */}
        {transcript && (
          <div className="mb-4 p-3 bg-card rounded-lg shadow-sm border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">You're saying:</p>
            <p className="text-foreground">"{transcript}"</p>
          </div>
        )}

        {/* Last message sent */}
        {lastMessage && !transcript && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary mb-1">Message sent:</p>
            <p className="text-primary/90">"{lastMessage}"</p>
          </div>
        )}

        {/* Speech error display */}
        {speechError && (
          <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Speech Error</p>
            </div>
            <p className="text-xs text-destructive/80">{speechError}</p>
          </div>
        )}

        {/* Status text */}
        <p className="mb-8 text-muted-foreground">
          {isSpeaking
            ? "AI is responding..."
            : isProcessing
              ? "Processing your question..."
              : isListening
                ? isMobile
                  ? "Listening... Speak clearly"
                  : "I'm listening... Ask me anything about your studies"
                : speechError
                  ? "Please resolve the error above to continue"
                  : isMobile
                    ? "Tap and hold the microphone to speak"
                    : "Tap the microphone to start speaking"}
        </p>

        {/* Main control button */}
        <div className="mb-8">
          {isSpeaking ? (
            <Button
              size="lg"
              className="h-20 w-20 rounded-full bg-destructive hover:bg-destructive/90 animate-pulse"
              onClick={stopSpeaking}
            >
              <VolumeX className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              size="lg"
              className={`h-20 w-20 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse scale-110"
                  : isProcessing
                    ? "bg-warning hover:bg-warning/90"
                    : speechError
                      ? "bg-muted hover:bg-muted/90"
                      : "bg-primary hover:bg-primary/90"
              }`}
              onClick={toggleListening}
              disabled={isProcessing || !!speechError}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              )}
            </Button>
          )}
        </div>

        {/* Back to Chat Button */}
        <Button variant="outline" onClick={onExitVoiceMode} className="bg-background/80 backdrop-blur-sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Back to Chat
        </Button>

        <div className="mt-6 text-xs text-muted-foreground">
          <p>
            💡 Tip:{" "}
            {isMobile
              ? "Speak clearly and wait for processing"
              : "Speak clearly and wait for the AI to finish responding"}
          </p>
          <p className="mt-1">🎵 Powered by Amazon Polly with Lottie animations</p>
          {isMobile && <p className="mt-1">📱 For best results on mobile, use Chrome or Safari</p>}
        </div>

        {/* Hidden audio element for Polly playback */}
        <audio
          ref={audioRef}
          style={{ display: "none" }}
          crossOrigin="anonymous"
          playsInline={isMobile}
          preload={isMobile ? "auto" : "metadata"}
        />
      </div>
    </div>
  )
}
