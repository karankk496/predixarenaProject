/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_NAME: "PredixArena",
    NEXT_PUBLIC_APP_DESCRIPTION: "Prediction Market Platform",
    NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000/api",
    NEXT_PUBLIC_AUTH_PROVIDERS: JSON.stringify(["google", "github"]),
    NEXT_PUBLIC_FEATURE_DARK_MODE: "true",
    NEXT_PUBLIC_FEATURE_BETA: "false",
  },
}

module.exports = nextConfig

