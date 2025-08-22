"use client"

import { Player } from "@lottiefiles/react-lottie-player"
import { Bot } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Import animations as static assets
const loadingAnimation = "/animations/animation-loading.json"
const waveAnimation = "/animations/animation-wave.json"

interface AssistantAvatarProps {
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  audioLevel?: number
  className?: string
}

export function AssistantAvatar({
  isListening,
  isSpeaking,
  isProcessing,
  audioLevel = 0,
  className = "",
}: AssistantAvatarProps) {
  const playerRef = useRef<any>(null)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  // Determine which animation to show and its properties
  const getAnimationConfig = () => {
    if (isProcessing) {
      return {
        animation: loadingAnimation,
        speed: 1,
        show: true,
        glowColor: "rgba(255, 193, 7, 0.15)", // Yellow glow
        borderColor: "border-yellow-300",
      }
    }

    if (isListening) {
      return {
        animation: waveAnimation,
        speed: 0.8 + (audioLevel / 100) * 0.7, // Speed based on audio level
        show: true,
        glowColor: "rgba(59, 130, 246, 0.15)", // Blue glow
        borderColor: "border-blue-300",
      }
    }

    if (isSpeaking) {
      return {
        animation: waveAnimation,
        speed: 0.9 + (audioLevel / 100) * 1.1, // Faster speed when speaking
        show: true,
        glowColor: "rgba(34, 197, 94, 0.15)", // Green glow
        borderColor: "border-green-300",
      }
    }

    return {
      animation: null,
      speed: 1,
      show: false,
      glowColor: "rgba(156, 163, 175, 0.1)", // Gray glow
      borderColor: "border-gray-300",
    }
  }

  const config = getAnimationConfig()

  // Update animation speed based on audio level
  useEffect(() => {
    if (playerRef.current && config.show) {
      playerRef.current.setPlayerSpeed(config.speed)
    }
  }, [config.speed, config.show])

  // Get avatar state styling
  const getAvatarStyling = () => {
    if (isProcessing) {
      return {
        bgColor: "bg-yellow-500",
        iconColor: "text-white",
        scale: "scale-100",
        pulse: "animate-pulse",
      }
    }

    if (isListening) {
      return {
        bgColor: "bg-blue-500",
        iconColor: "text-white",
        scale: "scale-105",
        pulse: "",
      }
    }

    if (isSpeaking) {
      return {
        bgColor: "bg-green-500",
        iconColor: "text-white",
        scale: "scale-105",
        pulse: "",
      }
    }

    return {
      bgColor: "bg-gray-500",
      iconColor: "text-white",
      scale: "scale-100",
      pulse: "",
    }
  }

  const avatarStyle = getAvatarStyling()

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow Container */}
      <div
        className={`
          w-72 h-72 rounded-full flex items-center justify-center
          bg-white transition-all duration-300 ${config.borderColor}
          border-4 shadow-lg
        `}
        style={{
          boxShadow: `0px 0px 40px 20px ${config.glowColor}`,
        }}
      >
        {/* Avatar Icon */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-300 ${avatarStyle.bgColor} 
            ${avatarStyle.scale} ${avatarStyle.pulse}
          `}
        >
          <Bot className={`w-8 h-8 ${avatarStyle.iconColor}`} />
        </div>
      </div>

      {/* Lottie Animation Overlay */}
      {config.show && config.animation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Player
            ref={playerRef}
            autoplay
            loop
            src={config.animation}
            style={{
              height: "301px",
              width: "301px",
              opacity: 0.9,
            }}
            speed={config.speed}
          />
        </div>
      )}

      {/* Audio Level Indicator */}
      {(isListening || isSpeaking) && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-1 rounded-full transition-all duration-150
                  ${isListening ? "bg-blue-400" : "bg-green-400"}
                `}
                style={{
                  height: `${Math.max(4, ((audioLevel * (i + 1)) / 5) * 0.3)}px`,
                  opacity: audioLevel > i * 20 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
