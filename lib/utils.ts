import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { config, type Config } from "./config"

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get global config
export function getGlobalConfig(): Config {
  try {
    return config
  } catch (error) {
    console.error("Error loading global config:", error)
    return {} as Config
  }
}

