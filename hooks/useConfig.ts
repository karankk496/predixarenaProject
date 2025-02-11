"use client"

import { useCallback } from "react"

interface Config {
  app: {
    name: string
    description: string
  }
  api: {
    baseUrl: string
  }
  auth: {
    providers: string[]
  }
  features: {
    darkMode: boolean
    beta: boolean
  }
}

export function useConfig(): Config {
  const getConfig = useCallback((): Config => {
    return {
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || "PredixArena",
        description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Prediction Market Platform",
      },
      api: {
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
      },
      auth: {
        providers: process.env.NEXT_PUBLIC_AUTH_PROVIDERS
          ? JSON.parse(process.env.NEXT_PUBLIC_AUTH_PROVIDERS)
          : ["google", "github"],
      },
      features: {
        darkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === "true",
        beta: process.env.NEXT_PUBLIC_FEATURE_BETA === "true",
      },
    }
  }, [])

  return getConfig()
}

