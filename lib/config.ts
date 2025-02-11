// Global configuration values
export const config = {
  // App configuration
  app: {
    name: "PredixArena",
    description: "Prediction Market Platform",
  },
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
  // Auth configuration
  auth: {
    providers: ["google", "github"],
  },
  // Feature flags
  features: {
    darkMode: true,
    beta: false,
  },
}

// Type definitions for config
export type Config = typeof config

// Initialize and export config
export function getConfig(): Config {
  return config
}

